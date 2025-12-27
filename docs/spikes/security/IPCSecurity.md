# IPC Security Configuration

## Overview

This document defines the IPC (Inter-Process Communication) security configuration for ProjectLibre Electron application, including channel whitelisting, rate limiting, and access control.

## IPC Channel Whitelist

### Core Application Channels (P0 - Critical)

| Channel | Purpose | Risk Level | Access Level | Rate Limit | Validation |
|---------|---------|------------|--------------|-------------|-------------|
| `java-execute` | Execute Java commands | **High** | Restricted | 10/5s | Command pattern, args validation |
| `get-app-version` | Get application version | **Low** | Public | 5/s | None required |
| `show-message-box` | Display dialog boxes | **Medium** | Restricted | 3/s | Options validation |
| `open-external` | Open external URLs | **High** | Restricted | 2/5s | URL validation, protocol check |
| `app-ready` | Signal app readiness | **Low** | Internal | 1/startup | Source validation |

### File Operations (P1 - Important)

| Channel | Purpose | Risk Level | Access Level | Rate Limit | Validation |
|---------|---------|------------|--------------|-------------|-------------|
| `read-project-file` | Read project files | **High** | Restricted | 5/2s | Path validation, extension check |
| `save-project-file` | Save project files | **High** | Restricted | 3/2s | Path validation, size limit |
| `browse-project-files` | File browser dialog | **Medium** | Restricted | 2/s | None required |
| `export-project` | Export project data | **Medium** | Restricted | 2/s | Format validation, size limit |
| `import-project` | Import project data | **High** | Restricted | 2/5s | File validation, scan check |

### System Operations (P2 - Limited)

| Channel | Purpose | Risk Level | Access Level | Rate Limit | Validation |
|---------|---------|------------|--------------|-------------|-------------|
| `get-system-info` | Get system information | **Medium** | Restricted | 1/s | None required |
| `check-java-version` | Check Java installation | **Low** | Public | 1/min | None required |
| `open-dev-tools` | Open developer tools | **Medium** | Dev Only | 1/s | Development mode check |
| `restart-app` | Restart application | **High** | Admin Only | 1/5min | Confirmation required |
| `quit-app` | Quit application | **Medium** | User | 1/s | None required |

### Event Channels (One-Way)

| Channel | Purpose | Direction | Risk Level | Validation |
|---------|---------|------------|--------------|-------------|
| `java-started` | Notify Java process start | Main → Renderer | **Low** | Event data sanitization |
| `java-stopped` | Notify Java process stop | Main → Renderer | **Low** | Event data sanitization |
| `java-error` | Notify Java process error | Main → Renderer | **Medium** | Error sanitization |
| `project-saved` | Notify project save success | Main → Renderer | **Low** | Path sanitization |
| `project-loaded` | Notify project load success | Main → Renderer | **Low** | Data sanitization |

## Rate Limiting Implementation

### Rate Limit Algorithm

```javascript
class RateLimiter {
    constructor() {
        this.limits = new Map();
        this.windows = new Map();
    }
    
    checkLimit(channel, source) {
        const config = this.getRateConfig(channel);
        if (!config) return true;
        
        const key = `${channel}:${source}`;
        const now = Date.now();
        const requests = this.windows.get(key) || [];
        
        // Clean old requests
        const validRequests = requests.filter(time => 
            now - time < config.windowMs
        );
        
        // Check if limit exceeded
        if (validRequests.length >= config.maxRequests) {
            console.warn(`Rate limit exceeded: ${channel} from ${source}`);
            return false;
        }
        
        // Add current request
        validRequests.push(now);
        this.windows.set(key, validRequests);
        return true;
    }
    
    getRateConfig(channel) {
        const configs = {
            'java-execute': { maxRequests: 10, windowMs: 5000 },
            'get-app-version': { maxRequests: 5, windowMs: 1000 },
            'show-message-box': { maxRequests: 3, windowMs: 1000 },
            'open-external': { maxRequests: 2, windowMs: 5000 },
            'read-project-file': { maxRequests: 5, windowMs: 2000 },
            'save-project-file': { maxRequests: 3, windowMs: 2000 },
            'get-system-info': { maxRequests: 1, windowMs: 1000 },
            'check-java-version': { maxRequests: 1, windowMs: 60000 },
            'open-dev-tools': { maxRequests: 1, windowMs: 1000 },
            'restart-app': { maxRequests: 1, windowMs: 300000 },
            'quit-app': { maxRequests: 1, windowMs: 1000 }
        };
        
        return configs[channel];
    }
    
    // Cleanup old entries periodically
    cleanup() {
        const now = Date.now();
        const maxAge = 600000; // 10 minutes
        
        for (const [key, requests] of this.windows.entries()) {
            const validRequests = requests.filter(time => 
                now - time < maxAge
            );
            
            if (validRequests.length === 0) {
                this.windows.delete(key);
            } else {
                this.windows.set(key, validRequests);
            }
        }
    }
}
```

### Advanced Rate Limiting Features

#### Sliding Window Implementation
```javascript
class SlidingWindowRateLimiter {
    constructor() {
        this.windows = new Map();
    }
    
    checkLimit(channel, source) {
        const config = this.getRateConfig(channel);
        if (!config) return true;
        
        const key = `${channel}:${source}`;
        const now = Date.now();
        const window = this.windows.get(key) || {
            requests: [],
            totalRequests: 0
        };
        
        // Remove requests outside the sliding window
        window.requests = window.requests.filter(timestamp => 
            now - timestamp < config.windowMs
        );
        
        // Check if adding current request exceeds limit
        if (window.requests.length >= config.maxRequests) {
            return false;
        }
        
        // Add current request
        window.requests.push(now);
        window.totalRequests++;
        this.windows.set(key, window);
        
        return true;
    }
    
    getStats(channel, source) {
        const key = `${channel}:${source}`;
        const window = this.windows.get(key);
        
        if (!window) {
            return { currentRequests: 0, totalRequests: 0 };
        }
        
        const now = Date.now();
        const recentRequests = window.requests.filter(timestamp => 
            now - timestamp < this.getRateConfig(channel).windowMs
        );
        
        return {
            currentRequests: recentRequests.length,
            totalRequests: window.totalRequests
        };
    }
}
```

#### Adaptive Rate Limiting
```javascript
class AdaptiveRateLimiter extends SlidingWindowRateLimiter {
    constructor() {
        super();
        this.userReputation = new Map();
        this.adaptiveConfigs = new Map();
    }
    
    checkLimit(channel, source) {
        const reputation = this.getUserReputation(source);
        const adaptiveConfig = this.getAdaptiveConfig(channel, reputation);
        
        // Adjust limits based on user reputation
        const originalConfig = this.getRateConfig(channel);
        const adjustedConfig = {
            maxRequests: Math.floor(originalConfig.maxRequests * adaptiveConfig.multiplier),
            windowMs: originalConfig.windowMs
        };
        
        return this.checkLimitWithConfig(channel, source, adjustedConfig);
    }
    
    getUserReputation(source) {
        const reputation = this.userReputation.get(source) || {
            score: 100, // Start with neutral reputation
            violations: 0,
            successfulRequests: 0
        };
        
        return reputation;
    }
    
    getAdaptiveConfig(channel, reputation) {
        // Adjust limits based on reputation score
        if (reputation.score >= 80) {
            return { multiplier: 1.5 }; // Trusted users get higher limits
        } else if (reputation.score >= 50) {
            return { multiplier: 1.0 }; // Normal users get standard limits
        } else {
            return { multiplier: 0.5 }; // Suspicious users get lower limits
        }
    }
    
    updateReputation(source, success, violation = false) {
        const reputation = this.getUserReputation(source);
        
        if (success) {
            reputation.successfulRequests++;
            reputation.score = Math.min(100, reputation.score + 0.1);
        } else if (violation) {
            reputation.violations++;
            reputation.score = Math.max(0, reputation.score - 10);
        }
        
        this.userReputation.set(source, reputation);
    }
}
```

## Access Control Implementation

### Role-Based Access Control

```javascript
class AccessController {
    constructor() {
        this.roles = new Map();
        this.userRoles = new Map();
        this.setupRoles();
    }
    
    setupRoles() {
        // Define roles and permissions
        this.roles.set('admin', {
            permissions: [
                'java-execute', 'read-project-file', 'save-project-file',
                'import-project', 'export-project', 'get-system-info',
                'open-dev-tools', 'restart-app', 'quit-app'
            ],
            priority: 100
        });
        
        this.roles.set('user', {
            permissions: [
                'java-execute', 'read-project-file', 'save-project-file',
                'import-project', 'export-project', 'quit-app'
            ],
            priority: 50
        });
        
        this.roles.set('readonly', {
            permissions: [
                'read-project-file', 'get-app-version'
            ],
            priority: 10
        });
    }
    
    hasPermission(channel, userId) {
        const userRole = this.userRoles.get(userId) || 'readonly';
        const role = this.roles.get(userRole);
        
        return role && role.permissions.includes(channel);
    }
    
    assignRole(userId, role) {
        if (this.roles.has(role)) {
            this.userRoles.set(userId, role);
            return true;
        }
        return false;
    }
    
    getEffectivePermissions(userId) {
        const userRole = this.userRoles.get(userId) || 'readonly';
        return this.roles.get(userRole)?.permissions || [];
    }
}
```

### Context-Based Access Control

```javascript
class ContextualAccessController extends AccessController {
    constructor() {
        super();
        this.contextRules = new Map();
        this.setupContextRules();
    }
    
    setupContextRules() {
        // Time-based restrictions
        this.contextRules.set('business-hours', {
            condition: (context) => {
                const hour = new Date().getHours();
                return hour >= 9 && hour <= 17;
            },
            restrictedChannels: ['java-execute', 'restart-app'],
            message: 'This operation is only allowed during business hours (9 AM - 5 PM)'
        });
        
        // Location-based restrictions
        this.contextRules.set('trusted-location', {
            condition: (context) => {
                // Check if user is in trusted network location
                return context.trustedLocation;
            },
            restrictedChannels: ['import-project', 'export-project'],
            message: 'This operation is only allowed from trusted locations'
        });
        
        // Application state restrictions
        this.contextRules.set('no-active-projects', {
            condition: (context) => {
                return !context.hasActiveProjects;
            },
            restrictedChannels: ['java-execute'],
            message: 'Cannot execute Java commands without active projects'
        });
    }
    
    checkContextualPermission(channel, userId, context) {
        // First check basic role-based permission
        if (!this.hasPermission(channel, userId)) {
            return { allowed: false, reason: 'Insufficient role permissions' };
        }
        
        // Then check contextual restrictions
        for (const [ruleName, rule] of this.contextRules.entries()) {
            if (!rule.condition(context) && rule.restrictedChannels.includes(channel)) {
                return { 
                    allowed: false, 
                    reason: rule.message,
                    contextRule: ruleName
                };
            }
        }
        
        return { allowed: true };
    }
}
```

## Input Validation Framework

### Schema-Based Validation

```javascript
class InputValidator {
    constructor() {
        this.schemas = new Map();
        this.setupSchemas();
    }
    
    setupSchemas() {
        // Java execution schema
        this.schemas.set('java-execute', {
            command: {
                type: 'string',
                required: true,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9_\-\.]+$/,
                allowedValues: ['start', 'stop', 'restart', 'status', 'execute']
            },
            args: {
                type: 'array',
                required: false,
                maxItems: 10,
                items: {
                    type: 'string',
                    maxLength: 500,
                    pattern: /^[a-zA-Z0-9_\-\/\.\s]+$/
                }
            }
        });
        
        // File operations schema
        this.schemas.set('read-project-file', {
            filePath: {
                type: 'string',
                required: true,
                maxLength: 500,
                pattern: /^[\w\-\/\\.]+$/,
                customValidation: (value) => {
                    const allowedExtensions = ['.pod', '.mpp', '.xml', '.xer', '.mpx'];
                    const extension = value.toLowerCase().slice(value.lastIndexOf('.'));
                    return allowedExtensions.includes(extension);
                }
            }
        });
        
        // URL opening schema
        this.schemas.set('open-external', {
            url: {
                type: 'string',
                required: true,
                maxLength: 2048,
                pattern: /^https?:\/\/.+/,
                customValidation: (value) => {
                    try {
                        const url = new URL(value);
                        const allowedProtocols = ['http:', 'https:'];
                        
                        return allowedProtocols.includes(url.protocol) &&
                               !url.hostname.includes('localhost') &&
                               !url.hostname.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/);
                    } catch {
                        return false;
                    }
                }
            }
        });
    }
    
    validate(channel, data) {
        const schema = this.schemas.get(channel);
        if (!schema) {
            return { valid: false, error: `No schema defined for channel: ${channel}` };
        }
        
        try {
            this.validateObject(data, schema);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
    
    validateObject(obj, schema) {
        for (const [fieldName, fieldSchema] of Object.entries(schema)) {
            const value = obj[fieldName];
            
            // Check required fields
            if (fieldSchema.required && (value === undefined || value === null)) {
                throw new Error(`Required field missing: ${fieldName}`);
            }
            
            // Skip validation if field is not provided and not required
            if (value === undefined && !fieldSchema.required) {
                continue;
            }
            
            // Type validation
            if (fieldSchema.type && typeof value !== fieldSchema.type) {
                throw new Error(`Invalid type for ${fieldName}: expected ${fieldSchema.type}, got ${typeof value}`);
            }
            
            // Length validation
            if (fieldSchema.maxLength && typeof value === 'string' && value.length > fieldSchema.maxLength) {
                throw new Error(`${fieldName} exceeds maximum length of ${fieldSchema.maxLength}`);
            }
            
            if (fieldSchema.minLength && typeof value === 'string' && value.length < fieldSchema.minLength) {
                throw new Error(`${fieldName} below minimum length of ${fieldSchema.minLength}`);
            }
            
            // Pattern validation
            if (fieldSchema.pattern && typeof value === 'string' && !fieldSchema.pattern.test(value)) {
                throw new Error(`${fieldName} does not match required pattern`);
            }
            
            // Allowed values validation
            if (fieldSchema.allowedValues && !fieldSchema.allowedValues.includes(value)) {
                throw new Error(`${fieldName} value not in allowed list: ${fieldSchema.allowedValues.join(', ')}`);
            }
            
            // Array validation
            if (fieldSchema.type === 'array' && Array.isArray(value)) {
                if (fieldSchema.maxItems && value.length > fieldSchema.maxItems) {
                    throw new Error(`${fieldName} array exceeds maximum size of ${fieldSchema.maxItems}`);
                }
                
                if (fieldSchema.items) {
                    value.forEach((item, index) => {
                        try {
                            this.validateObject(item, { item: fieldSchema.items });
                        } catch (error) {
                            throw new Error(`${fieldName}[${index}]: ${error.message}`);
                        }
                    });
                }
            }
            
            // Custom validation
            if (fieldSchema.customValidation) {
                if (!fieldSchema.customValidation(value)) {
                    throw new Error(`${fieldName} failed custom validation`);
                }
            }
        }
    }
}
```

## Security Monitoring

### IPC Event Logging

```javascript
class IPCSecurityMonitor {
    constructor() {
        this.eventLog = [];
        this.alertThresholds = {
            violationsPerMinute: 10,
            failedAuthPerHour: 5,
            suspiciousPatternsPerHour: 3
        };
        this.setupMonitoring();
    }
    
    setupMonitoring() {
        // Monitor all IPC communications
        const originalHandle = ipcMain.handle;
        
        ipcMain.handle = (channel, handler) => {
            return async (event, ...args) => {
                const startTime = Date.now();
                const source = this.identifySource(event);
                
                try {
                    // Log the attempt
                    this.logEvent({
                        type: 'ipc_request',
                        channel,
                        source,
                        timestamp: startTime,
                        args: this.sanitizeArgs(args)
                    });
                    
                    // Execute the handler
                    const result = await handler(event, ...args);
                    
                    // Log successful execution
                    this.logEvent({
                        type: 'ipc_success',
                        channel,
                        source,
                        timestamp: Date.now(),
                        duration: Date.now() - startTime
                    });
                    
                    return result;
                    
                } catch (error) {
                    // Log failed execution
                    this.logEvent({
                        type: 'ipc_error',
                        channel,
                        source,
                        timestamp: Date.now(),
                        duration: Date.now() - startTime,
                        error: error.message
                    });
                    
                    throw error;
                }
            };
        };
    }
    
    identifySource(event) {
        // Try to identify the source of the IPC call
        const frameId = event.sender.getFrameId();
        const processId = event.sender.processId;
        
        return {
            frameId,
            processId,
            timestamp: Date.now(),
            userAgent: event.sender.getUserAgent(),
            url: event.sender.getURL()
        };
    }
    
    sanitizeArgs(args) {
        // Remove sensitive information from logs
        return args.map(arg => {
            if (typeof arg === 'string' && arg.length > 100) {
                return '[REDACTED:LONG_STRING]';
            }
            if (typeof arg === 'object' && arg.password) {
                return { ...arg, password: '[REDACTED]' };
            }
            return arg;
        });
    }
    
    logEvent(event) {
        this.eventLog.push({
            ...event,
            id: this.generateEventId()
        });
        
        // Check for security patterns
        this.analyzeEvent(event);
        
        // Cleanup old events
        this.cleanupEvents();
    }
    
    analyzeEvent(event) {
        switch (event.type) {
            case 'ipc_error':
                this.analyzeError(event);
                break;
            case 'ipc_request':
                this.analyzeRequest(event);
                break;
        }
    }
    
    analyzeError(error) {
        // Check for authentication failures
        if (error.error.includes('authentication') || 
            error.error.includes('authorization') ||
            error.error.includes('permission denied')) {
            this.checkAuthFailureThreshold(error);
        }
        
        // Check for input validation failures
        if (error.error.includes('validation') ||
            error.error.includes('invalid') ||
            error.error.includes('malformed')) {
            this.checkValidationFailureThreshold(error);
        }
    }
    
    analyzeRequest(request) {
        // Check for suspicious patterns
        if (this.isSuspiciousPattern(request)) {
            this.incrementSuspiciousActivity(request);
        }
    }
    
    isSuspiciousPattern(request) {
        // Check for rapid successive requests to high-risk channels
        const recentRequests = this.eventLog.filter(e =>
            e.type === 'ipc_request' &&
            e.channel === request.channel &&
            e.source.frameId === request.source.frameId &&
            (request.timestamp - e.timestamp) < 1000 // Within 1 second
        );
        
        return recentRequests.length > 5; // More than 5 requests per second
    }
    
    checkAuthFailureThreshold(error) {
        const recentFailures = this.eventLog.filter(e =>
            e.type === 'ipc_error' &&
            e.error.includes('authentication') &&
            (error.timestamp - e.timestamp) < 3600000 // Within 1 hour
        );
        
        if (recentFailures.length >= this.alertThresholds.failedAuthPerHour) {
            this.triggerSecurityAlert('auth_failure_threshold', {
                count: recentFailures.length,
                timeWindow: '1 hour'
            });
        }
    }
    
    triggerSecurityAlert(type, details) {
        console.error('SECURITY ALERT:', type, details);
        
        // Send alert to security monitoring system
        ipcMain.emit('security-alert', {
            type,
            details,
            timestamp: new Date().toISOString(),
            severity: this.determineSeverity(type)
        });
        
        // Implement response based on alert type
        this.respondToSecurityAlert(type, details);
    }
    
    respondToSecurityAlert(type, details) {
        switch (type) {
            case 'auth_failure_threshold':
                // Implement temporary account lockout
                break;
            case 'suspicious_activity_threshold':
                // Implement increased monitoring
                break;
            case 'rate_limit_exceeded':
                // Implement temporary throttling
                break;
        }
    }
    
    generateEventId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    cleanupEvents() {
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        const cutoff = Date.now() - maxAge;
        
        this.eventLog = this.eventLog.filter(event => 
            event.timestamp > cutoff
        );
    }
}
```

## Testing IPC Security

### Security Test Suite

```javascript
class IPSSecurityTester {
    constructor() {
        this.testResults = [];
    }
    
    async runAllTests() {
        await this.testRateLimiting();
        await this.testInputValidation();
        await this.testAccessControl();
        await this.testInjectionAttacks();
        await this.testPrivilegeEscalation();
        
        this.generateReport();
    }
    
    async testRateLimiting() {
        console.log('Testing rate limiting...');
        
        // Test rapid successive calls
        const promises = [];
        for (let i = 0; i < 15; i++) {
            promises.push(ipcRenderer.invoke('java-execute', 'test', [i.toString()]));
        }
        
        const results = await Promise.allSettled(promises);
        const rejectedCount = results.filter(r => r.status === 'rejected').length;
        
        this.recordTest('rate_limiting', rejectedCount > 5, 
            `Rate limiting ${rejectedCount > 5 ? 'working' : 'not working'}`);
    }
    
    async testInputValidation() {
        console.log('Testing input validation...');
        
        // Test malicious command injection
        try {
            await ipcRenderer.invoke('java-execute', 'rm -rf /', []);
            this.recordTest('command_injection', false, 'Command injection not blocked');
        } catch (error) {
            this.recordTest('command_injection', true, 'Command injection properly blocked');
        }
        
        // Test path traversal
        try {
            await ipcRenderer.invoke('read-project-file', '../../../etc/passwd');
            this.recordTest('path_traversal', false, 'Path traversal not blocked');
        } catch (error) {
            this.recordTest('path_traversal', true, 'Path traversal properly blocked');
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
        
        console.log(`IPC Security Test Results: ${passed}/${total} tests passed`);
        
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

## Conclusion

This IPC security configuration provides comprehensive protection against:

1. **Unauthorized Access**: Role-based and contextual access control
2. **Abuse**: Rate limiting and adaptive throttling  
3. **Injection Attacks**: Input validation and sanitization
4. **Privilege Escalation**: Permission checks and least privilege
5. **Data Exfiltration**: URL validation and external access controls

Regular monitoring, testing, and updates of security configurations are essential for maintaining effective IPC security.