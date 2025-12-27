@echo off
echo Starting ProjectLibre Electron Application in development mode...
echo.

REM Запускаем Vite в одном терминале
start /B cmd /C "cd /d "%~dp0" && npm run dev:vite"

REM Ждем 3 секунды для запуска Vite
timeout /t 3 /nobreak >nul

REM Запускаем Electron в другом терминале
start /B cmd /C "cd /d "%~dp0" && npm run dev:electron"

echo.
echo Both processes started. Check for new terminal windows.
echo Press any key to continue...
pause >nul