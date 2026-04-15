@echo off
REM 3D Model Viewer Startup Script for Windows

echo 🏆 3D Model Viewer Startup Script
echo ================================

REM Check if we're in the correct directory
if not exist "wails.json" (
    echo ❌ Error: wails.json not found. Please run this script from the 3dview directory.
    pause
    exit /b 1
)

REM Check if Wails is installed
where wails >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Wails CLI is not installed.
    echo Please install it with: go install github.com/wailsapp/wails/v2/cmd/wails@latest
    pause
    exit /b 1
)

REM Check if Go is installed
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Go is not installed or not in PATH.
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

echo ✅ All prerequisites met
echo.

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo ✅ Frontend dependencies installed
    echo.
)

REM Start Wails development server
echo 🚀 Starting 3D Model Viewer in development mode...
echo.
wails dev

pause
