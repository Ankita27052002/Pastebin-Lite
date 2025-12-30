# Instructions for Running Locally

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ankita27052002/Pastebin-Lite.git
   cd Pastebin-Lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Upstash Redis**
   - Sign up at https://upstash.com (free tier available)
   - Create a new Redis database
   - Copy the REST URL and Token

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Add your Upstash credentials:
     ```
     UPSTASH_REDIS_REST_URL=your_url_here
     UPSTASH_REDIS_REST_TOKEN=your_token_here
     BASE_URL=http://localhost:5173
     ```

5. **Run the application**
   
   Open two terminal windows:
   
   **Terminal 1 - Backend:**
   ```bash
   npm run dev:server
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Access the app**
   - Open browser to http://localhost:5173

## Testing

Run the test script (make sure the server is running):
```bash
node test.js
```

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!
