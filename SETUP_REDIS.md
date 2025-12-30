# Upstash Redis Setup Guide

## Quick Setup Instructions

### 1. Create a Free Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Click "Get Started" or "Sign Up"
3. Sign up with GitHub, Google, or email

### 2. Create a Redis Database

1. After logging in, click "Create Database"
2. Choose a name for your database (e.g., "pastebin-db")
3. Select a region closest to your deployment location
4. Choose "Free" tier
5. Click "Create"

### 3. Get Your Credentials

1. After the database is created, you'll see your database dashboard
2. Scroll down to the "REST API" section
3. You'll see two important values:
   - **UPSTASH_REDIS_REST_URL** (looks like: https://xxxxx.upstash.io)
   - **UPSTASH_REDIS_REST_TOKEN** (a long string)

### 4. Update Your .env File

Copy the `.env.example` file to `.env` if you haven't already:

```bash
cp .env.example .env
```

Then edit `.env` and paste your credentials:

```env
UPSTASH_REDIS_REST_URL=https://your-actual-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-actual-token-here
BASE_URL=http://localhost:5173
TEST_MODE=0
```

### 5. Restart Your Server

Stop your backend server (Ctrl+C) and start it again:

```bash
npm run dev:server
```

You should see: ✅ Redis configured successfully

### For Vercel Deployment

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `BASE_URL` (your Vercel deployment URL, e.g., https://your-app.vercel.app)
   - `TEST_MODE` (set to 1 for automated testing, 0 for production)

4. Redeploy your application

## Troubleshooting

### Error: "Service temporarily unavailable. Redis not configured."

This means your Redis credentials are not set or are incorrect.

**Solution:**
1. Check that your `.env` file exists and has valid credentials
2. Make sure there are no extra spaces or quotes around the values
3. Restart your backend server after updating `.env`

### Error: "Failed to execute 'json' on 'Response'"

This usually means the backend API is not running or not responding properly.

**Solution:**
1. Make sure the backend server is running (`npm run dev:server`)
2. Check that Redis credentials are properly configured
3. Check the terminal running the backend for error messages

### Still Having Issues?

1. Check the backend terminal for error messages
2. Verify your Upstash dashboard shows the database as "Active"
3. Try creating a new database in Upstash and using those credentials
4. Make sure your `.env` file is in the root directory of the project

## Testing Your Setup

Once configured, test that everything works:

```bash
# In one terminal, start the backend
npm run dev:server

# In another terminal, start the frontend
npm run dev
```

Then open http://localhost:5173 and try creating a paste.

## Need Help?

If you're still having issues:
1. Check the Upstash documentation: https://docs.upstash.com/redis
2. Make sure your firewall/network allows connections to Upstash
3. Verify you're using the REST API credentials (not the native Redis credentials)
