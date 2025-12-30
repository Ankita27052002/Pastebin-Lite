# Pastebin Lite

A minimal Pastebin-like application where users can create text pastes with optional expiry times (TTL) and view limits. Built with React, Node.js/Express, and Upstash Redis.

## 🚀 Features

- Create text pastes with unique shareable URLs
- Optional time-based expiry (TTL)
- Optional view-count limits
- Clean, responsive UI
- RESTful API
- Server-side HTML rendering for paste viewing
- Safe content rendering (XSS protection)

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite (build tool)
- JavaScript (ES6+)

**Backend:**
- Node.js
- Express.js
- CORS middleware

**Database:**
- Upstash Redis (serverless NoSQL)

## 📦 Persistence Layer

This application uses **Upstash Redis** as its persistence layer. Upstash Redis is a serverless Redis database that is perfect for serverless deployments (like Vercel). It provides:

- HTTP-based REST API for Redis operations
- Automatic scaling
- No connection pooling required
- Works seamlessly with serverless functions
- Persistent storage across requests

The choice of Upstash Redis ensures that:
1. Pastes persist across serverless function invocations
2. No need to maintain persistent connections
3. Easy integration with Vercel and other serverless platforms
4. Built-in support for TTL (time-to-live) at the database level

## 🔧 Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Upstash Redis account (free tier available)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Pastebin
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

2. Sign up for a free Upstash account at [https://upstash.com](https://upstash.com)

3. Create a new Redis database in Upstash console

4. Copy your Redis REST URL and Token

5. Update your `.env` file:

```env
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
BASE_URL=http://localhost:5173
TEST_MODE=0
```

### Step 4: Run the Application

You need to run both the backend API server and the frontend development server:

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```
This starts the Express server on port 3001.

**Terminal 2 - Frontend Development Server:**
```bash
npm run dev
```
This starts the Vite development server on port 5173.

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

The Vite dev server will proxy API requests to the Express server running on port 3001.

## 📡 API Endpoints

### Health Check
```
GET /api/healthz
```
Returns application health status.

**Response:**
```json
{ "ok": true }
```

### Create Paste
```
POST /api/pastes
```

**Request Body:**
```json
{
  "content": "string (required)",
  "ttl_seconds": 60,  // optional, integer >= 1
  "max_views": 5      // optional, integer >= 1
}
```

**Response:**
```json
{
  "id": "abc123",
  "url": "https://your-app.vercel.app/p/abc123"
}
```

### Fetch Paste (API)
```
GET /api/pastes/:id
```

**Response:**
```json
{
  "content": "string",
  "remaining_views": 4,           // null if unlimited
  "expires_at": "2026-01-01T00:00:00.000Z"  // null if no TTL
}
```

Note: Each API fetch decrements the view count.

### View Paste (HTML)
```
GET /p/:id
```

Returns an HTML page displaying the paste content. This endpoint also decrements the view count.

## 🧪 Testing Features

### Test Mode

The application supports deterministic time testing via the `TEST_MODE` environment variable.

Set `TEST_MODE=1` in your environment variables, then use the `x-test-now-ms` header in your requests:

```bash
curl -H "x-test-now-ms: 1672531200000" http://localhost:3001/api/pastes/abc123
```

This allows automated tests to verify expiry logic without waiting for real time to pass.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Visit [vercel.com](https://vercel.com) and import your repository

3. Configure environment variables in Vercel dashboard:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `BASE_URL` (your Vercel deployment URL)
   - `TEST_MODE` (optional, for automated tests)

4. Deploy!

The `vercel.json` configuration file is already set up to handle routing for both the API endpoints and the frontend.

## 📝 Important Design Decisions

1. **Upstash Redis for Persistence**: Chosen for serverless compatibility and built-in TTL support.

2. **Separate API and HTML Routes**: The `/api/pastes/:id` returns JSON for API consumers, while `/p/:id` returns HTML for direct browser viewing.

3. **View Counting**: Both API fetches and HTML views count towards the view limit to prevent circumvention.

4. **XSS Protection**: All user content is properly escaped before rendering in HTML to prevent script injection.

5. **Constraint Triggering**: When either TTL expires OR view limit is reached, the paste becomes unavailable immediately.

6. **Auto-deletion**: Pastes are deleted from the database once they become unavailable (expired or view limit reached) to save storage.

7. **Nanoid for IDs**: Using nanoid library to generate short, URL-safe unique identifiers (10 characters).

8. **Proxy Configuration**: In development, Vite proxies API requests to the Express server for seamless local development.

## 📂 Project Structure

```
Pastebin/
├── api/
│   └── index.js           # Express server with all API endpoints
├── src/
│   ├── App.jsx            # Main React component
│   ├── App.css            # Component styles
│   ├── index.css          # Global styles
│   └── main.jsx           # React entry point
├── public/                # Static assets
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── vercel.json           # Vercel deployment configuration
├── vite.config.js        # Vite configuration with proxy
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🤝 Contributing

This is a take-home assignment project. For any issues or suggestions, please open an issue or submit a pull request.

## 📄 License

MIT
