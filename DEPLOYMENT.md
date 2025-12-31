# Vercel Deployment Guide for Pastebin-Lite

## Required Environment Variables

Configure these in your Vercel project settings (Settings → Environment Variables):

### Production Variables

```
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

### Optional Variables

```
# Leave BASE_URL empty - the app auto-detects from request headers
BASE_URL=

# Only set TEST_MODE=1 for test environments running automated tests
TEST_MODE=0
```

## Where to Get Redis Credentials

1. Sign up at https://console.upstash.com
2. Create a new Redis database (free tier available)
3. Click on your database
4. Copy the "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN"
5. Add them to Vercel environment variables

## Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] Vercel project created and linked to repository
- [ ] Environment variables configured in Vercel
- [ ] .env files NOT committed (they're in .gitignore)
- [ ] Test deployment with health check: `https://your-app.vercel.app/api/healthz`
- [ ] Create a test paste to verify functionality
- [ ] Check paste expiry and view limits work correctly

## Troubleshooting

### "Unable to determine base URL" Error
- Make sure you leave `BASE_URL` empty or don't set it in Vercel
- The app will automatically detect the correct URL from request headers

### "Redis not configured" Error
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in Vercel
- Check credentials are correct in Upstash console
- Ensure no typos in variable names (they're case-sensitive)

### Build Failures
- Check the Vercel build logs for specific errors
- Verify `vercel.json` is present in repository root
- Ensure both frontend and backend package.json files have all dependencies

### 404 Errors on Routes
- Verify `vercel.json` routing configuration is correct
- Check that `/api/*` and `/p/*` routes point to backend
- Ensure frontend build output is in `frontend/dist`

## Testing in Production

### Health Check
```bash
curl https://your-app.vercel.app/api/healthz
```

Expected response:
```json
{"ok":true}
```

### Create Paste via API
```bash
curl -X POST https://your-app.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello from production!","ttl_seconds":300,"max_views":5}'
```

### Test with Time Header (if TEST_MODE=1)
```bash
curl -H "x-test-now-ms: $(date +%s)000" \
  https://your-app.vercel.app/api/pastes/your_paste_id
```
