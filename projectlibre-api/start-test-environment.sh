#!/bin/bash

# ProjectLibre API Test Environment Launcher
# Starts complete testing environment with observability

set -e

echo "=== ProjectLibre API Test Environment Launcher ==="
echo "Starting comprehensive test environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

# Stop any existing containers
print_header "Stopping Existing Containers"
docker-compose -f docker-compose.test.yml down -v --remove-orphans || true

# Clean up old logs
print_header "Cleaning Up"
rm -rf logs/*
rm -rf test-data/*

# Create necessary directories
mkdir -p logs
mkdir -p test-data
mkdir -p test-scripts

# Create test database initialization script
print_header "Creating Test Database Setup"
cat > test-scripts/init.sql << 'EOF'
-- Test database initialization
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial test data
INSERT INTO test_results (test_name, status) VALUES 
    ('environment-setup', 'running'),
    ('api-connectivity', 'pending'),
    ('observability', 'pending'),
    ('performance', 'pending');
EOF

# Build and start containers
print_header "Building and Starting Containers"
docker-compose -f docker-compose.test.yml build --no-cache
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be ready
print_header "Waiting for Services"
echo "Waiting for database..."
sleep 10

echo "Waiting for API..."
until curl -f http://localhost:8080/api/health > /dev/null 2>&1; do
    echo "API not ready yet..."
    sleep 5
done

echo "Waiting for observability..."
sleep 5

# Run API tests
print_header "Running API Tests"
echo "Testing API endpoints..."

# Test health endpoints
echo "Testing health checks..."
curl -s http://localhost:8080/api/health | jq '.' || echo "Health check failed"
curl -s http://localhost:8080/api/health/detailed | jq '.' || echo "Detailed health check failed"

# Test API endpoints
echo "Testing API endpoints..."
curl -s -X GET http://localhost:8080/api/projects || echo "Projects endpoint test failed"
curl -s -X GET http://localhost:8080/api/tasks || echo "Tasks endpoint test failed"
curl -s -X GET http://localhost:8080/api/resources || echo "Resources endpoint test failed"

# Test error handling
echo "Testing error handling..."
curl -s -X GET http://localhost:8080/api/nonexistent || echo "Error handling test (expected failure)"

# Run performance tests
print_header "Running Performance Tests"
echo "Running load test with 20 threads, 50 requests each..."

# Simple performance test script
cat > test-scripts/performance-test.sh << 'EOF'
#!/bin/bash
echo "Starting performance test..."

for i in {1..20}; do
    (
        for j in {1..50}; do
            curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/api/health &
            sleep 0.1
        done
        wait
        echo "Thread $i completed"
    ) &
done

wait
echo "Performance test completed"
EOF

chmod +x test-scripts/performance-test.sh
./test-scripts/performance-test.sh

# Check observability
print_header "Checking Observability"
echo "Access observability dashboards:"
echo "Prometheus: http://localhost:9091"
echo "Grafana: http://localhost:3001 (admin/admin123)"

# Get metrics
echo "Current metrics:"
curl -s http://localhost:8080/api/metrics | jq 'keys[]' 2>/dev/null || echo "Metrics collection test failed"

# Generate test report
print_header "Generating Test Report"
cat > test-report.md << EOF
# ProjectLibre API Test Report

**Test Date:** $(date)
**Environment:** Test
**API Version:** 1.0.0

## Test Results

### Health Checks
- Basic Health: $(curl -s http://localhost:8080/api/health | jq -r '.status' 2>/dev/null || echo "FAILED")
- Detailed Health: $(curl -s http://localhost:8080/api/health/detailed | jq -r '.status' 2>/dev/null || echo "FAILED")

### API Endpoints
- Projects: $(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/api/projects)
- Tasks: $(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/api/tasks)
- Resources: $(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/api/resources)

### Observability
- Metrics Endpoint: $(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/api/metrics)
- Log Files: $(ls -la logs/ | wc -l)

### Container Status
$(docker-compose -f docker-compose.test.yml ps)

## Next Steps

1. Check Grafana dashboards: http://localhost:3001
2. Review Prometheus metrics: http://localhost:9091
3. Analyze log files in logs/ directory
4. Run performance optimization if needed
EOF

echo "Test report generated: test-report.md"

# Show logs
print_header "Application Logs"
echo "=== Recent Application Logs ==="
tail -n 20 logs/projectlibre-api-test.log 2>/dev/null || echo "No log file found"

print_header "Environment Ready!"
echo "✅ Test environment is running"
echo "📊 Observability:"
echo "   - Prometheus: http://localhost:9091"
echo "   - Grafana: http://localhost:3001 (admin/admin123)"
echo "📋 Test Report: test-report.md"
echo "📝 Logs: logs/"
echo ""
echo "To stop environment: docker-compose -f docker-compose.test.yml down"
echo "To view logs: docker-compose -f docker-compose.test.yml logs -f"
echo ""
echo "Use Ctrl+C to exit monitoring"