#!/bin/bash

echo "========================================"
echo "   Pastebin-Lite Local Development"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "WARNING: .env file not found!"
    echo "Please copy .env.example to .env and configure your Upstash Redis credentials."
    echo ""
    exit 1
fi

echo "Starting backend server and frontend dev server..."
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo "========================================"
echo ""

# Start backend in background
npm run dev:server &
BACKEND_PID=$!

# Wait 2 seconds for backend to start
sleep 2

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Function to kill both processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT TERM

# Wait for both processes
wait
