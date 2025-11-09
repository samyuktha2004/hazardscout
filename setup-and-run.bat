@echo off
echo ===============================================
echo    Hazard Scout - Setup and Run Script
echo ===============================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

echo Installing dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Setup complete! Starting development server...
echo The application will open in your browser at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.

npm run dev
pause
