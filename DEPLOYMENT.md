# Deployment Guide

## Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Upstash Redis account (free tier available)

### Step 1: Prepare Your Repository

Ensure all code is committed and pushed to GitHub:
```bash
git add -A
git commit -m "Ready for deployment"
git push origin master
```

### Step 2: Set Up Upstash Redis

1. Go to [https://upstash.com](https://upstash.com) and sign up
2. Click "Create Database"
3. Choose a name for your database
4. Select a region close to your target users
5. Click "Create"
6. On the database page, click on "REST API" tab
7. Copy the following:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 3: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `Ankita27052002/Pastebin-Lite`
4. Configure the project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (should be auto-detected)
   - **Output Directory:** `dist` (should be auto-detected)

5. Add Environment Variables (click "Environment Variables" section):
   ```
   UPSTASH_REDIS_REST_URL = your_upstash_url
   UPSTASH_REDIS_REST_TOKEN = your_upstash_token
   BASE_URL = https://your-app-name.vercel.app
   TEST_MODE = 0
   ```
   
   **Important:** For `BASE_URL`, you can initially use a placeholder. After the first deployment, Vercel will give you a URL. Update this environment variable with your actual Vercel URL and redeploy.

6. Click "Deploy"

### Step 4: Update BASE_URL After First Deploy

1. After deployment completes, copy your Vercel URL (e.g., `https://pastebin-lite-abc123.vercel.app`)
2. Go to your project settings in Vercel
3. Navigate to "Environment Variables"
4. Update `BASE_URL` to your actual Vercel URL
5. Redeploy the application

### Step 5: Enable TEST_MODE for Automated Tests

If you need to run automated tests with deterministic time:

1. Go to your Vercel project settings
2. Add or update the environment variable:
   ```
   TEST_MODE = 1
   ```
3. Redeploy

When TEST_MODE is enabled, your API will accept the `x-test-now-ms` header for time-based testing.

### Step 6: Verify Deployment

Test your deployed application:

1. **Health Check:**
   ```bash
   curl https://your-app.vercel.app/api/healthz
   ```

2. **Create a Paste:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content":"Hello from deployed app!","ttl_seconds":60}'
   ```

3. **View in Browser:**
   - Go to `https://your-app.vercel.app`
   - Create a paste using the UI
   - Visit the generated link

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Ensure no syntax errors in code
- Check Vercel build logs for specific errors

### Redis Connection Issues

- Verify environment variables are set correctly in Vercel
- Check that Upstash Redis database is active
- Test credentials using curl:
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" YOUR_REDIS_URL/ping
  ```

### Routes Not Working

- Ensure `vercel.json` is present in the repository root
- Check that API routes are properly configured
- Review Vercel function logs

### 404 Errors on Paste View

- Verify Redis is storing data correctly
- Check that paste IDs are being generated properly
- Ensure the `/p/:id` route is working in Vercel functions

## Continuous Deployment

Once set up, Vercel will automatically deploy when you push to your GitHub repository:

```bash
git add -A
git commit -m "Your changes"
git push origin master
```

Vercel will automatically build and deploy your changes within minutes.

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. Update `BASE_URL` environment variable to your custom domain
6. Redeploy

## Monitoring

- View deployment logs in Vercel dashboard
- Check function logs for runtime errors
- Monitor Upstash Redis usage in Upstash console
