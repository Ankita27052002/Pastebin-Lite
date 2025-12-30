@echo off
echo ========================================
echo    Pastebin-Lite Local Development
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and configure your Upstash Redis credentials.
    echo.
    pause
    exit /b 1
)

echo Starting backend server and frontend dev server...
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C in either window to stop the servers.
echo ========================================
echo.

REM Start backend in a new window
start "Pastebin Backend" cmd /k "npm run dev:server"

REM Wait 2 seconds for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend in a new window
start "Pastebin Frontend" cmd /k "npm run dev"

echo Both servers are starting in separate windows...
echo.
