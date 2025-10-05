@echo off
REM Quick Network Setup Script for Windows
REM This script helps you find your IP and configure the network

echo.
echo ========================================
echo   Bug Tracker - Network Setup Helper
echo ========================================
echo.

REM Check if running from correct directory
if not exist "server\package.json" (
    echo Error: Please run this script from the Bug-Tracker root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [1/4] Finding your network IP address...
echo.

REM Get primary network IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set IP=%%a
    goto :found_ip
)

:found_ip
REM Trim whitespace
for /f "tokens=* delims= " %%a in ("%IP%") do set IP=%%a

if "%IP%"=="" (
    echo No IPv4 address found!
    echo Please check your network connection.
    pause
    exit /b 1
)

echo Found IP Address: %IP%
echo.

echo [2/4] Your network configuration:
echo.
ipconfig | findstr /C:"Wireless" /C:"Ethernet" /C:"IPv4"
echo.

echo [3/4] Next steps:
echo.
echo Update this file:
echo   frontend\src\config\networkConfig.js
echo.
echo Change the BACKEND_URL to:
echo   BACKEND_URL: isDevelopment
echo     ? 'http://%IP%:5000'  ^<-- Use this IP
echo     : 'https://your-production-api.com',
echo.

echo [4/4] Quick commands:
echo.
echo   Start server:
echo     cd server
echo     npm start
echo.
echo   Test connection:
echo     cd server
echo     npm run test-network
echo.
echo   Find IP again:
echo     cd server  
echo     npm run find-ip
echo.

echo ========================================
echo   Setup complete! Follow the steps above.
echo ========================================
echo.

REM Ask if user wants to open the config file
set /p OPEN="Do you want to open networkConfig.js now? (Y/N): "
if /i "%OPEN%"=="Y" (
    if exist "frontend\src\config\networkConfig.js" (
        notepad "frontend\src\config\networkConfig.js"
    ) else (
        echo File not found: frontend\src\config\networkConfig.js
    )
)

echo.
pause
