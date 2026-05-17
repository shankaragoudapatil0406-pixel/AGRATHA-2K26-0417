@echo off
title AGRATHA 2K26 - Local Server
color 0B
echo.
echo  ================================================
echo    AGRATHA 2K26 - College Fest Management Portal
echo  ================================================
echo.
echo  Starting local server...
echo.

cd /d "%~dp0AGRATHA-2K26-0417"

echo  Server root: %cd%
echo.
echo  ------------------------------------------------
echo   Open in browser:
echo.
echo   Homepage:      http://localhost:8000
echo   Events:        http://localhost:8000/events.html
echo   Add Events:    http://localhost:8000/add-events.html
echo   Admin Events:  http://localhost:8000/admin-events.html
echo   Login:         http://localhost:8000/login.html
echo  ------------------------------------------------
echo.
echo  Press Ctrl+C to stop the server.
echo.

start http://localhost:8000

python -m http.server 8000
