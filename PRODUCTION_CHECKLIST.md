# Production Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Quality
- [x] All hardcoded localhost URLs removed
- [x] No secrets/credentials in repository
- [x] Debug console.logs removed from production code
- [x] React version documented correctly (18)
- [x] .env files in .gitignore
- [x] .env.example files provided for reference

### Build & Configuration
- [x] Frontend builds successfully (`npm run build`)
- [x] Backend has proper start script
- [x] vercel.json configured correctly
- [x] .vercelignore created
- [x] vercel-build script added to frontend package.json

### API Compliance
- [x] GET /api/healthz returns HTTP 200 + JSON
- [x] POST /api/pastes validates input correctly
- [x] GET /api/pastes/:id returns proper JSON
- [x] GET /p/:id returns HTML with XSS protection
- [x] All /api/* routes return JSON with Content-Type header
- [x] 404 responses for unavailable pastes
- [x] TTL and view limits work correctly
- [x] TEST_MODE support with x-test-now-ms header

### Documentation
- [x] README.md updated with deployment instructions
- [x] DEPLOYMENT.md created with detailed Vercel guide
- [x] Environment variables documented
- [x] Local development setup instructions clear
- [x] Persistence layer (Upstash Redis) documented

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git push origin master
```

### 2. Connect to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel auto-detects configuration from vercel.json

### 3. Set Environment Variables in Vercel

**Required Variables:**
```
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Optional Variables:**
```
BASE_URL=          (leave empty for auto-detection)
TEST_MODE=0        (set to 1 only for test environments)
```

### 4. Deploy
Click "Deploy" in Vercel dashboard

### 5. Verify Deployment

**Test Health Check:**
```bash
curl https://your-app.vercel.app/api/healthz
```

Expected: `{"ok":true}`

**Test Create Paste:**
```bash
curl -X POST https://your-app.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Production test!","ttl_seconds":300,"max_views":5}'
```

Expected: `{"id":"...","url":"https://your-app.vercel.app/p/..."}`

**Test View Paste:**
Visit the URL from previous response in your browser

## 📊 Post-Deployment Testing

### Functional Tests
- [ ] Health check responds successfully
- [ ] Can create paste via web UI
- [ ] Can create paste via API
- [ ] Paste URL opens correctly
- [ ] View count decrements correctly
- [ ] Paste expires after TTL
- [ ] Paste becomes unavailable after max_views
- [ ] 404 returned for non-existent pastes
- [ ] XSS protection working (test with `<script>alert('xss')</script>`)

### Edge Cases
- [ ] Empty content returns 400 error
- [ ] Invalid ttl_seconds returns 400 error
- [ ] Invalid max_views returns 400 error
- [ ] Paste with TTL + max_views respects both constraints
- [ ] Remaining views doesn't go negative
- [ ] Expired pastes return 404, not stale data

### Performance
- [ ] API responses are fast (< 500ms)
- [ ] Frontend loads quickly
- [ ] No memory leaks or crashes under load

## 🔧 Troubleshooting

### If Deployment Fails
1. Check Vercel build logs for errors
2. Verify vercel.json syntax is correct
3. Ensure all dependencies are in package.json
4. Test build locally: `cd frontend && npm run build`

### If API Returns Errors
1. Check Vercel function logs
2. Verify environment variables are set correctly
3. Test Redis connection in Upstash console
4. Ensure credentials haven't expired

### If Pastes Don't Save
1. Verify UPSTASH_REDIS_REST_URL is correct
2. Verify UPSTASH_REDIS_REST_TOKEN is correct
3. Check Redis database is active in Upstash console
4. Review Vercel function logs for Redis errors

## 📝 Submission Checklist

For take-home assignment submission:

- [ ] Deployed URL: `https://your-app.vercel.app`
- [ ] Git repository: `https://github.com/Ankita27052002/Pastebin-Lite`
- [ ] README.md includes:
  - [ ] Project description
  - [ ] How to run locally
  - [ ] Persistence layer documentation (Upstash Redis)
  - [ ] Important design decisions
- [ ] All automated tests pass
- [ ] No secrets in repository
- [ ] No hardcoded localhost URLs

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ All API endpoints respond correctly
- ✅ Web UI works for creating and viewing pastes
- ✅ TTL and view limits function properly
- ✅ No console errors in browser
- ✅ No errors in Vercel logs
- ✅ Fast response times (< 500ms)
- ✅ Automated tests can run against deployed URL
