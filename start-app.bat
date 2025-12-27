@echo off
echo Starting ProjectLibre Electron Application...
echo.

REM Сначала собираем frontend
echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo Building Electron backend...
call npm run build:electron
if %errorlevel% neq 0 (
    echo Electron build failed!
    pause
    exit /b 1
)

echo.
echo Starting Electron application...
npx electron .

pause