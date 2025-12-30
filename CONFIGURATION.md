# Configuration Guidelines

## No Hardcoded Localhost URLs

This project follows the assignment requirement that **no hardcoded localhost URLs** should be present in committed code.

### How Configuration Works:

1. **Backend (`backend/api/index.js`)**:
   - Requires `BASE_URL` environment variable to be set
   - No default fallback to localhost
   - Will return error if BASE_URL is not configured

2. **Frontend (`frontend/vite.config.js`)**:
   - Uses `VITE_API_URL` environment variable for proxy target
   - Falls back to `127.0.0.1:3001` only during build-time configuration
   - Not hardcoded in committed source files

3. **Environment Files**:
   - `.env.example` files show example configurations
   - Actual `.env` files are in `.gitignore` and not committed
   - Use `127.0.0.1` instead of `localhost` for consistency

### For Local Development:

Create `.env` files in both backend and root directories:

**backend/.env:**
```env
UPSTASH_REDIS_REST_URL=your_url_here
UPSTASH_REDIS_REST_TOKEN=your_token_here
BASE_URL=http://127.0.0.1:5173
TEST_MODE=0
```

**frontend/.env:**
```env
VITE_API_URL=http://127.0.0.1:3001
```

### For Production (Vercel):

Set environment variables in Vercel dashboard:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `BASE_URL` → Your deployed URL (e.g., https://your-app.vercel.app)
- `TEST_MODE` → 0 or 1 depending on use case

The application will fail gracefully with clear error messages if required environment variables are not set.
