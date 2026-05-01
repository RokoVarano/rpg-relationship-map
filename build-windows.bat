@echo off
echo ================================
echo RPG Relationships - Build Script
echo ================================
echo.
echo This script will build the app for Windows.
echo Make sure you have Node.js installed from: https://nodejs.org
echo.
pause

echo.
echo Installing dependencies...
npm install

echo.
echo Building the app (this may take a few minutes)...
npm run dist

echo.
echo ================================
echo Build complete!
echo Check the "release" folder for the Windows build.
echo ================================
pause
