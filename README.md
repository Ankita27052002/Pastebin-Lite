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
- React 18
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
git clone https://github.com/Ankita27052002/Pastebin-Lite.git
cd Pastebin-Lite
```

### Step 2: Install Dependencies

Install dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install separately:

```bash
# Install frontend dependencies
npm run install:frontend

# Install backend dependencies
npm run install:backend
```

### Step 3: Configure Environment Variables

Copy the example environment files and configure them:

**Backend Configuration:**
```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your Upstash Redis credentials:

```env
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
BASE_URL=
TEST_MODE=0
```

**Frontend Configuration:**
```bash
cp frontend/.env.example frontend/.env
```

The default configuration should work for local development:

```env
VITE_API_URL=http://localhost:3001
```

### Step 4: Run the Application

**Option 1: Run both frontend and backend together (recommended):**

```bash
npm run dev:all
```

This will start both servers concurrently.

**Option 2: Run separately in different terminals:**

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
curl -H "x-test-now-ms: 1672531200000" http://127.0.0.1:3001/api/pastes/abc123
```

This allows automated tests to verify expiry logic without waiting for real time to pass.

## 🚢 Deployment

### Deploy to Vercel (Recommended)

#### Prerequisites
- Upstash Redis account with database created
- GitHub account
- Vercel account

#### Step-by-Step Deployment

**1. Prepare Your Repository**

Ensure all changes are committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin master
```

**2. Import to Vercel**

- Visit [vercel.com](https://vercel.com) and sign in with GitHub
- Click "New Project"
- Import your `Pastebin-Lite` repository
- Vercel will auto-detect the configuration from `vercel.json`

**3. Configure Environment Variables**

In the Vercel project settings, add these environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis REST URL | ✅ Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis REST Token | ✅ Yes |
| `BASE_URL` | Leave empty (auto-detected) | ❌ No |
| `TEST_MODE` | `1` (only if running automated tests) | ❌ No |

**Important Notes:**
- Do NOT set `BASE_URL` - the app will auto-detect it from request headers
- Get your Upstash credentials from the [Upstash Console](https://console.upstash.com)
- `TEST_MODE` should only be `1` for test environments

**4. Deploy**

Click "Deploy" and wait for the build to complete. Your app will be live at:
```
https://your-project-name.vercel.app
```

**5. Verify Deployment**

Test these endpoints:
- Health check: `https://your-app.vercel.app/api/healthz`
- Create a paste via UI: `https://your-app.vercel.app`
- Test API directly with curl/Postman

#### Deployment Notes

- The `vercel.json` configuration handles routing for API and frontend
- Frontend is built as a static site and served from `/`
- Backend API runs as serverless functions
- Redis connection is automatically established via environment variables
- Logs are available in Vercel dashboard under "Logs" tab

### Alternative Deployment Options

This app can be deployed to any platform supporting Node.js, but requires:
- Persistent Redis instance (Upstash, Redis Cloud, etc.)
- Ability to run Node.js Express backend
- Static file hosting for React frontend

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
Pastebin-Lite/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── App.css       # Component styles
│   │   ├── index.css     # Global styles
│   │   └── main.jsx      # React entry point
│   ├── public/           # Static assets
│   ├── index.html        # HTML template
│   ├── vite.config.js    # Vite configuration
│   ├── eslint.config.js  # ESLint configuration
│   └── package.json      # Frontend dependencies
├── backend/              # Node.js/Express backend
│   ├── api/
│   │   └── index.js      # Express server with all API endpoints
│   ├── .env              # Backend environment variables
│   └── package.json      # Backend dependencies
├── .env                  # Root environment variables
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── vercel.json          # Vercel deployment configuration
├── package.json         # Root package.json for scripts
├── SETUP_REDIS.md       # Redis setup guide
└── README.md            # This file
```

## 🤝 Contributing

This is a take-home assignment project. For any issues or suggestions, please open an issue or submit a pull request.

## 📄 License

MIT
