@echo off
echo Starting ProjectLibre build process...
echo.

echo Step 1: Building projectlibre-core with Ant...
cd /d "%~dp0projectlibre_core"
call apache-ant-1.10.14\bin\ant clean dist
if %ERRORLEVEL% neq 0 (
    echo ERROR: Core build failed!
    exit /b 1
)
echo Core build SUCCESSFUL!

echo.
echo Step 2: Building projectlibre-api with Maven...
cd /d "%~dp0projectlibre-api"
call apache-maven-3.9.5\bin\mvn.cmd clean package -DskipTests -Dmaven.test.skip=true
if %ERRORLEVEL% neq 0 (
    echo ERROR: API build failed!
    exit /b 1
)
echo API build SUCCESSFUL!

echo.
echo Step 3: Copy JAR to resources...
copy target\projectlibre-api-1.0.0.jar ..\resources\java\projectlibre.jar
if %ERRORLEVEL% neq 0 (
    echo ERROR: JAR copy failed!
    exit /b 1
)
echo JAR copy SUCCESSFUL!

echo.
echo ===================================
echo ProjectLibre build COMPLETED!
echo ===================================
pause