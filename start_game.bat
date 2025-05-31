@echo off
echo Starting 3D Iron Golem Game Server...
echo.
echo Starting HTTP server on port 8000...
start /B python -m http.server 8000
echo.
echo Waiting for server to start...
timeout /t 3 /nobreak >nul
echo.
echo Opening game in browser...
start http://localhost:8000
echo.
echo Game server is running at: http://localhost:8000
echo Press Ctrl+C to stop the server when done playing.
echo.
pause 