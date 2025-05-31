@echo off
echo Starting HTTP server for walking animation test...
echo.
echo Open your browser and go to:
echo http://localhost:8000/test_walking.html
echo.
echo Use WASD keys to move and watch for:
echo - Leg and arm animations
echo - Footstep sounds
echo - Debug info in top-left corner
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000 