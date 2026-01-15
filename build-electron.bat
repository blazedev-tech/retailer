@echo off
REM Retailer Management System - Electron Build Script for Windows
REM This script builds the Electron application

echo ==================================
echo Retailer Management System Builder
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo [INFO] NPM version:
npm --version
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install --legacy-peer-deps
    echo [SUCCESS] Dependencies installed!
    echo.
)

REM Build Next.js application
echo [INFO] Building Next.js application...
call npm run build
echo [SUCCESS] Next.js build complete!
echo.

REM Prompt user for platform selection
echo Select platform to build:
echo 1) Windows only
echo 2) All platforms (Windows, macOS, Linux)
echo 3) Windows + Linux
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo [INFO] Building for Windows...
    call npx electron-builder --win
) else if "%choice%"=="2" (
    echo [INFO] Building for all platforms...
    call npx electron-builder -mwl
) else if "%choice%"=="3" (
    echo [INFO] Building for Windows and Linux...
    call npx electron-builder --win --linux
) else (
    echo [ERROR] Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build complete!
echo.
echo Your application has been built and can be found in the 'dist' directory.
echo.
echo Installation instructions:
echo   - Windows: Run the .exe installer from dist\
echo   - Linux: Install the .AppImage or .deb from dist\
echo.
echo [SUCCESS] Thank you for using Retailer Management System!
pause
