@echo off
cls
echo ==========================================
echo   AI Chatbot Management System
echo ==========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit
)

:: Check package.json
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script in the project root folder.
    pause
    exit
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting development server...
echo Please wait for the server to start completely.
echo.

:: Start the development server in a new window
start "AI Chatbot Server" cmd /k "npm run dev"

echo Development server is starting in a new window.
echo.
echo Once you see "Ready - started server on 0.0.0.0:3000" message,
echo the management page will be available at:
echo http://localhost:3000/management
echo.
echo You can also access the main app at:
echo http://localhost:3000
echo.

:: Wait and then open browser
echo Opening management page in 10 seconds...
timeout /t 10 >nul
start http://localhost:3000/management

echo.
echo Management page opened in browser.
echo Press any key to close this window.
pause >nul