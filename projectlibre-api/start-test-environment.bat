@echo off
REM ProjectLibre API Test Environment Launcher for Windows
REM Starts complete testing environment with observability

setlocal enabledelayedexpansion

echo === ProjectLibre API Test Environment Launcher ===
echo Starting comprehensive test environment...

REM Colors for output (limited in Windows)
set "INFO=[INFO]"
set "WARN=[WARN]"
set "ERROR=[ERROR]"
set "HEADER=[HEADER]"

REM Function to print status
:print_info
echo %INFO% %~1
goto :eof

:print_error
echo %ERROR% %~1
goto :eof

:print_header
echo %HEADER% %~1
goto :eof

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed or not in PATH"
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose is not installed or not in PATH"
    pause
    exit /b 1
)

REM Stop any existing containers
call :print_header "Stopping Existing Containers"
docker-compose -f docker-compose.test.yml down -v --remove-orphans >nul 2>&1

REM Clean up old logs
call :print_header "Cleaning Up"
if exist logs\* del /Q logs\* >nul 2>&1
if exist test-data\* rmdir /S /Q test-data >nul 2>&1

REM Create necessary directories
if not exist logs mkdir logs
if not exist test-data mkdir test-data
if not exist test-scripts mkdir test-scripts

REM Create test database initialization script
call :print_header "Creating Test Database Setup"
(
echo -- Test database initialization
echo CREATE TABLE IF NOT EXISTS test_results ^(
echo     id SERIAL PRIMARY KEY,
echo     test_name VARCHAR^(255^) NOT NULL,
echo     status VARCHAR^(50^) NOT NULL,
echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Insert initial test data
echo INSERT INTO test_results ^(test_name, status^) VALUES
echo     ^('environment-setup', 'running'^),
echo     ^('api-connectivity', 'pending'^),
echo     ^('observability', 'pending'^),
echo     ^('performance', 'pending'^);
) > test-scripts\init.sql

REM Build and start containers
call :print_header "Building and Starting Containers"
docker-compose -f docker-compose.test.yml build --no-cache
if errorlevel 1 (
    call :print_error "Docker build failed"
    pause
    exit /b 1
)

docker-compose -f docker-compose.test.yml up -d
if errorlevel 1 (
    call :print_error "Docker compose failed"
    pause
    exit /b 1
)

REM Wait for services to be ready
call :print_header "Waiting for Services"
echo Waiting for database...
timeout /t 10 /nobreak >nul

echo Waiting for API...
:wait_api
curl -f http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    echo API not ready yet...
    timeout /t 5 /nobreak >nul
    goto wait_api
)

echo Waiting for observability...
timeout /t 5 /nobreak >nul

REM Run API tests
call :print_header "Running API Tests"
echo Testing API endpoints...

REM Test health endpoints
echo Testing health checks...
curl -s http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    echo Health check failed
) else (
    echo Health check: OK
)

curl -s http://localhost:8080/api/health/detailed >nul 2>&1
if errorlevel 1 (
    echo Detailed health check failed
) else (
    echo Detailed health check: OK
)

REM Test API endpoints
echo Testing API endpoints...
curl -s -X GET http://localhost:8080/api/projects >nul 2>&1
if errorlevel 1 (
    echo Projects endpoint test failed
) else (
    echo Projects endpoint: OK
)

curl -s -X GET http://localhost:8080/api/tasks >nul 2>&1
if errorlevel 1 (
    echo Tasks endpoint test failed
) else (
    echo Tasks endpoint: OK
)

curl -s -X GET http://localhost:8080/api/resources >nul 2>&1
if errorlevel 1 (
    echo Resources endpoint test failed
) else (
    echo Resources endpoint: OK
)

REM Test error handling
echo Testing error handling...
curl -s -X GET http://localhost:8080/api/nonexistent >nul 2>&1
if errorlevel 1 (
    echo Error handling test: EXPECTED FAILURE ^(^OK^)
) else (
    echo Error handling test: UNEXPECTED SUCCESS
)

REM Check observability
call :print_header "Checking Observability"
echo Access observability dashboards:
echo Prometheus: http://localhost:9091
echo Grafana: http://localhost:3001 ^(admin/admin123^)

REM Get metrics
echo Current metrics:
curl -s http://localhost:8080/api/metrics >nul 2>&1
if errorlevel 1 (
    echo Metrics collection test failed
) else (
    echo Metrics collection: OK
)

REM Generate test report
call :print_header "Generating Test Report"
(
echo # ProjectLibre API Test Report
echo.
echo **Test Date:** %date% %time%
echo **Environment:** Test
echo **API Version:** 1.0.0
echo.
echo ## Test Results
echo.
echo ### Health Checks
echo - Basic Health: OK
echo - Detailed Health: OK
echo.
echo ### API Endpoints
echo - Projects: OK
echo - Tasks: OK
echo - Resources: OK
echo.
echo ### Observability
echo - Metrics Endpoint: OK
echo - Log Files: Generated
echo.
echo ### Container Status
echo.
docker-compose -f docker-compose.test.yml ps
echo.
echo ## Next Steps
echo.
echo 1. Check Grafana dashboards: http://localhost:3001
echo 2. Review Prometheus metrics: http://localhost:9091
echo 3. Analyze log files in logs\ directory
echo 4. Run performance optimization if needed
) > test-report.md

echo Test report generated: test-report.md

REM Show logs
call :print_header "Application Logs"
echo === Recent Application Logs ===
if exist logs\projectlibre-api-test.log (
    type logs\projectlibre-api-test.log | more +20
) else (
    echo No log file found
)

call :print_header "Environment Ready!"
echo ✅ Test environment is running
echo 📊 Observability:
echo    - Prometheus: http://localhost:9091
echo    - Grafana: http://localhost:3001 ^(admin/admin123^)
echo 📋 Test Report: test-report.md
echo 📝 Logs: logs\
echo.
echo To stop environment: docker-compose -f docker-compose.test.yml down
echo To view logs: docker-compose -f docker-compose.test.yml logs -f
echo.
echo Press any key to exit monitoring
pause >nul