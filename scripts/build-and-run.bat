@echo off
echo Building ProjectLibre for production...
echo.

REM Создаем папку для ресурсов если ее нет
if not exist "resources" mkdir resources
if not exist "resources\jre\bin" mkdir resources\jre\bin
if not exist "resources\logs" mkdir resources\logs

REM Создаем mock JAR если его нет
if not exist "resources\projectlibre.jar.bat" (
    echo Creating mock JAR...
    (
        echo @echo off
        echo echo Started ProjectLibreApplication
        echo echo Mock Java backend started on port %%1
        echo :loop
        echo timeout /t 1 /nobreak ^>nul
        echo goto loop
    ) > resources\projectlibre.jar.bat
)

REM Создаем mock Java если его нет
if not exist "resources\jre\bin\java.exe" (
    echo Creating mock Java...
    (
        echo @echo off
        echo echo Mock Java for development
        echo echo %%*
        echo exit /b 0
    ) > resources\jre\bin\java.exe
)

echo.
echo Building application...
call npm run build
call npm run build:electron

echo.
echo Starting application...
npx electron .

pause