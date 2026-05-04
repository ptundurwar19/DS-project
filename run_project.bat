@echo off
echo ========================================================
echo        Starting Neuro-DS Project Services
echo ========================================================

:: Open a new command prompt for the Backend API
echo Starting Python FastAPI backend...
start "Neuro-DS Backend API" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

:: Open a new command prompt for the React Frontend
echo Starting React Frontend...
start "Neuro-DS React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up! 
echo A browser window should open automatically, or you can go to:
echo http://localhost:5173
echo.
echo (You can close this black window, but keep the two new windows open while working)
pause
