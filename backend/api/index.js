import express from 'express';
import cors from 'cors';
import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set JSON content type for all API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Initialize Redis client
let redis;
let redisConfigured = false;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    redisConfigured = true;
    console.log('✅ Redis configured successfully');
  } catch (error) {
    console.error('❌ Redis initialization error:', error);
  }
} else {
  console.warn('⚠️  Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.');
}

// Helper function to get current time (supports TEST_MODE)
const getCurrentTime = (req) => {
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    return parseInt(req.headers['x-test-now-ms'], 10);
  }
  return Date.now();
};

// Health check endpoint
app.get('/api/healthz', async (req, res) => {
  try {
    // Check if Redis is accessible
    if (redis) {
      await redis.ping();
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(200).json({ ok: false, error: error.message });
  }
});

// Create a paste
app.post('/api/pastes', async (req, res) => {
  try {
    // Check if Redis is configured
    if (!redisConfigured || !redis) {
      return res.status(503).json({ error: 'Service temporarily unavailable. Redis not configured.' });
    }

    const { content, ttl_seconds, max_views } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
    }

    // Validate ttl_seconds
    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
      }
    }

    // Validate max_views
    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return res.status(400).json({ error: 'max_views must be an integer >= 1' });
      }
    }

    // Generate unique ID
    const id = nanoid(10);

    // Calculate expiry timestamp if TTL is provided
    const currentTime = getCurrentTime(req);
    const expires_at = ttl_seconds ? currentTime + (ttl_seconds * 1000) : null;

    // Create paste object
    const paste = {
      content,
      expires_at,
      max_views: max_views || null,
      remaining_views: max_views || null,
      created_at: currentTime,
    };

    // Store in Redis
    await redis.set(`paste:${id}`, JSON.stringify(paste));

    // Set TTL in Redis if specified (as a backup expiry mechanism)
    if (ttl_seconds) {
      await redis.expire(`paste:${id}`, ttl_seconds + 60); // Add buffer
    }

    // Construct URL using request headers first (matches what user is accessing)
    let baseUrl;
    
    // Try to get the base URL from request headers first
    if (req.headers.origin) {
      baseUrl = req.headers.origin;
    } else if (req.headers.referer) {
      const refererUrl = new URL(req.headers.referer);
      baseUrl = `${refererUrl.protocol}//${refererUrl.host}`;
    } else if (req.headers.host) {
      const protocol = req.protocol || 'http';
      baseUrl = `${protocol}://${req.headers.host}`;
    } else {
      // Fall back to environment variable only if no headers available
      baseUrl = process.env.BASE_URL;
    }
    
    if (!baseUrl) {
      return res.status(500).json({ error: 'Unable to determine base URL' });
    }
    
    const url = `${baseUrl}/p/${id}`;

    return res.status(201).json({ id, url });
  } catch (error) {
    console.error('Error creating paste:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Fetch a paste (API)
app.get('/api/pastes/:id', async (req, res) => {
  try {
    // Check if Redis is configured
    if (!redisConfigured || !redis) {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }

    const { id } = req.params;
    const currentTime = getCurrentTime(req);

    // Fetch paste from Redis
    const pasteData = await redis.get(`paste:${id}`);

    if (!pasteData) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = typeof pasteData === 'string' ? JSON.parse(pasteData) : pasteData;

    // Check if paste has expired
    if (paste.expires_at && currentTime >= paste.expires_at) {
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste has expired' });
    }

    // Check if view limit exceeded
    if (paste.remaining_views !== null && paste.remaining_views <= 0) {
      await redis.del(`paste:${id}`);
      return res.status(404).json({ error: 'Paste view limit exceeded' });
    }

    // Decrement remaining views
    if (paste.remaining_views !== null) {
      paste.remaining_views -= 1;
      
      // If no more views left, delete the paste
      if (paste.remaining_views <= 0) {
        await redis.del(`paste:${id}`);
      } else {
        await redis.set(`paste:${id}`, JSON.stringify(paste));
      }
    }

    // Prepare response
    const response = {
      content: paste.content,
      remaining_views: paste.remaining_views,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View a paste (HTML)
app.get('/p/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentTime = getCurrentTime(req);

    // Fetch paste from Redis
    const pasteData = await redis.get(`paste:${id}`);

    if (!pasteData) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paste Not Found</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #e53e3e; }
          </style>
        </head>
        <body>
          <h1>404 - Paste Not Found</h1>
          <p>This paste does not exist or has been removed.</p>
        </body>
        </html>
      `);
    }

    const paste = typeof pasteData === 'string' ? JSON.parse(pasteData) : pasteData;

    // Check if paste has expired
    if (paste.expires_at && currentTime >= paste.expires_at) {
      await redis.del(`paste:${id}`);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paste Expired</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #e53e3e; }
          </style>
        </head>
        <body>
          <h1>404 - Paste Expired</h1>
          <p>This paste has expired and is no longer available.</p>
        </body>
        </html>
      `);
    }

    // Check if view limit exceeded
    if (paste.remaining_views !== null && paste.remaining_views <= 0) {
      await redis.del(`paste:${id}`);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paste Unavailable</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #e53e3e; }
          </style>
        </head>
        <body>
          <h1>404 - Paste Unavailable</h1>
          <p>This paste has reached its view limit and is no longer available.</p>
        </body>
        </html>
      `);
    }

    // Decrement remaining views (HTML view also counts)
    if (paste.remaining_views !== null) {
      paste.remaining_views -= 1;
      
      if (paste.remaining_views <= 0) {
        await redis.del(`paste:${id}`);
      } else {
        await redis.set(`paste:${id}`, JSON.stringify(paste));
      }
    }

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    };

    const escapedContent = escapeHtml(paste.content);

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Paste View</title>
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            max-width: 900px; 
            margin: 20px auto; 
            padding: 20px; 
            background: #f7fafc;
          }
          .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 30px;
          }
          h1 { color: #2d3748; margin-top: 0; }
          .info {
            background: #edf2f7;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #4a5568;
          }
          .content {
            background: #f7fafc;
            padding: 20px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', monospace;
            line-height: 1.6;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
          }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #4299e1;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
          }
          .btn:hover {
            background: #3182ce;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📋 Paste</h1>
          ${paste.remaining_views !== null || paste.expires_at ? `
            <div class="info">
              ${paste.remaining_views !== null ? `Views remaining: ${paste.remaining_views}` : ''}
              ${paste.remaining_views !== null && paste.expires_at ? ' | ' : ''}
              ${paste.expires_at ? `Expires: ${new Date(paste.expires_at).toLocaleString()}` : ''}
            </div>
          ` : ''}
          <div class="content">${escapedContent}</div>
          <div class="footer">
            <a href="/" class="btn">Create New Paste</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error viewing paste:', error);
    res.status(500).send('Internal server error');
  }
});

// Start server (only if not in serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
