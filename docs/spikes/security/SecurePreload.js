/**
 * Secure Preload Script for ProjectLibre Electron App
 * 
 * Features:
 * - Context Bridge for secure IPC communication
 * - API whitelisting
 * - Input validation
 * - Rate limiting
 * - Error handling
 * 
 * Security Principles:
 * - No direct Node.js access in renderer
 * - Context isolation enabled
 * - Explicit API exposure only
 * - Input sanitization
 */

const { contextBridge, ipcRenderer } = require('electron');

// Rate limiting configuration
const RATE_LIMITS = {
    'java-execute': { calls: 10, window: 5000 }, // 10 calls per 5 seconds
    'get-app-version': { calls: 5, window: 1000 },  // 5 calls per second
    'show-message-box': { calls: 3, window: 1000 }, // 3 calls per second
    'open-external': { calls: 2, window: 5000 }   // 2 calls per 5 seconds
};

// Rate limiter implementation
const rateLimiter = new Map();

function checkRateLimit(channel) {
    const limit = RATE_LIMITS[channel];
    if (!limit) return true;
    
    const now = Date.now();
    const calls = rateLimiter.get(channel) || [];
    
    // Clean old calls
    const validCalls = calls.filter(call => now - call < limit.window);
    
    if (validCalls.length >= limit.calls) {
        console.warn(`Rate limit exceeded for channel: ${channel}`);
        return false;
    }
    
    validCalls.push(now);
    rateLimiter.set(channel, validCalls);
    return true;
}

// Input validation functions
function validateInput(data, schema) {
    if (typeof data !== schema.type) {
        throw new Error(`Invalid type: expected ${schema.type}, got ${typeof data}`);
    }
    
    if (schema.allowedValues && !schema.allowedValues.includes(data)) {
        throw new Error(`Invalid value: ${data} not in allowed values`);
    }
    
    if (schema.maxLength && data.length > schema.maxLength) {
        throw new Error(`Input too long: max ${schema.maxLength} characters`);
    }
    
    if (schema.min !== undefined && data < schema.min) {
        throw new Error(`Value too small: minimum ${schema.min}`);
    }
    
    if (schema.max !== undefined && data > schema.max) {
        throw new Error(`Value too large: maximum ${schema.max}`);
    }
    
    if (schema.pattern && !schema.pattern.test(data)) {
        throw new Error(`Invalid format: does not match required pattern`);
    }
    
    return true;
}

// Secure API for Java operations
const javaAPI = {
    /**
     * Execute Java command securely
     * @param {string} command - Command to execute
     * @param {Array} args - Command arguments
     * @returns {Promise} Execution result
     */
    execute: async (command, args = []) => {
        if (!checkRateLimit('java-execute')) {
            throw new Error('Rate limit exceeded for Java execution');
        }
        
        // Validate command
        validateInput(command, {
            type: 'string',
            maxLength: 100,
            pattern: /^[a-zA-Z0-9_\-\.]+$/
        });
        
        // Validate arguments
        if (!Array.isArray(args)) {
            throw new Error('Arguments must be an array');
        }
        
        args.forEach((arg, index) => {
            validateInput(arg, {
                type: 'string',
                maxLength: 500
            });
        });
        
        try {
            return await ipcRenderer.invoke('java-execute', command, args);
        } catch (error) {
            console.error('Java execution failed:', error);
            throw new Error('Java operation failed');
        }
    }
};

// Secure API for system operations
const systemAPI = {
    /**
     * Get application version
     * @returns {Promise<string>} App version
     */
    getVersion: async () => {
        if (!checkRateLimit('get-app-version')) {
            throw new Error('Rate limit exceeded for version requests');
        }
        
        return await ipcRenderer.invoke('get-app-version');
    },
    
    /**
     * Show message box
     * @param {Object} options - Message box options
     * @returns {Promise} Message box result
     */
    showMessageBox: async (options) => {
        if (!checkRateLimit('show-message-box')) {
            throw new Error('Rate limit exceeded for message boxes');
        }
        
        // Validate message box options
        validateInput(options, { type: 'object' });
        
        if (options.message) {
            validateInput(options.message, {
                type: 'string',
                maxLength: 1000
            });
        }
        
        if (options.title) {
            validateInput(options.title, {
                type: 'string',
                maxLength: 100
            });
        }
        
        // Only allow specific message box types
        const allowedTypes = ['info', 'warning', 'error', 'question'];
        if (options.type && !allowedTypes.includes(options.type)) {
            throw new Error(`Invalid message box type: ${options.type}`);
        }
        
        return await ipcRenderer.invoke('show-message-box', options);
    },
    
    /**
     * Open external URL securely
     * @param {string} url - URL to open
     * @returns {Promise} Open result
     */
    openExternal: async (url) => {
        if (!checkRateLimit('open-external')) {
            throw new Error('Rate limit exceeded for external opens');
        }
        
        // Validate URL
        validateInput(url, {
            type: 'string',
            maxLength: 2048,
            pattern: /^https?:\/\/.+/
        });
        
        // Additional security checks
        try {
            const urlObj = new URL(url);
            
            // Block dangerous protocols
            const allowedProtocols = ['http:', 'https:'];
            if (!allowedProtocols.includes(urlObj.protocol)) {
                throw new Error(`Protocol not allowed: ${urlObj.protocol}`);
            }
            
            // Block localhost access
            if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                throw new Error('Localhost access not allowed');
            }
            
            // Block private IP ranges
            const privateIPs = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
            if (privateIPs.test(urlObj.hostname)) {
                throw new Error('Private IP access not allowed');
            }
            
        } catch (error) {
            if (error.message.includes('URL')) {
                throw new Error('Invalid URL format');
            }
            throw error;
        }
        
        return await ipcRenderer.invoke('open-external', url);
    }
};

// Event API with secure listeners
const eventAPI = {
    /**
     * Listen to Java events
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    onJavaEvent: (event, callback) => {
        const allowedEvents = ['java-started', 'java-stopped', 'java-error'];
        
        if (!allowedEvents.includes(event)) {
            throw new Error(`Event not allowed: ${event}`);
        }
        
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        // Wrap callback for security
        const secureCallback = (event, data) => {
            try {
                // Validate event data
                if (typeof data === 'object' && data !== null) {
                    // Sanitize object properties
                    const sanitized = {};
                    for (const [key, value] of Object.entries(data)) {
                        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                            sanitized[key] = value;
                        }
                    }
                    callback(sanitized);
                } else {
                    callback(data);
                }
            } catch (error) {
                console.error('Event callback error:', error);
            }
        };
        
        ipcRenderer.on(event, secureCallback);
    },
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     */
    removeJavaListener: (event) => {
        const allowedEvents = ['java-started', 'java-stopped', 'java-error'];
        
        if (!allowedEvents.includes(event)) {
            throw new Error(`Event not allowed: ${event}`);
        }
        
        ipcRenderer.removeAllListeners(event);
    },
    
    /**
     * Remove all event listeners
     */
    removeAllListeners: () => {
        const allowedEvents = ['java-started', 'java-stopped', 'java-error'];
        allowedEvents.forEach(event => {
            ipcRenderer.removeAllListeners(event);
        });
    }
};

// File operations API
const fileAPI = {
    /**
     * Read project file
     * @param {string} filePath - Path to file
     * @returns {Promise} File data
     */
    readProjectFile: async (filePath) => {
        // Validate file path
        validateInput(filePath, {
            type: 'string',
            maxLength: 500
        });
        
        // Only allow project file extensions
        const allowedExtensions = ['.pod', '.mpp', '.xml', '.xer', '.mpx'];
        const extension = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
        
        if (!allowedExtensions.includes(extension)) {
            throw new Error(`File extension not allowed: ${extension}`);
        }
        
        return await ipcRenderer.invoke('read-project-file', filePath);
    },
    
    /**
     * Save project file
     * @param {string} filePath - Path to save file
     * @param {Object} data - Project data
     * @returns {Promise} Save result
     */
    saveProjectFile: async (filePath, data) => {
        validateInput(filePath, {
            type: 'string',
            maxLength: 500
        });
        
        validateInput(data, { type: 'object' });
        
        // Only allow project file extensions
        const allowedExtensions = ['.pod', '.xml', '.xer'];
        const extension = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
        
        if (!allowedExtensions.includes(extension)) {
            throw new Error(`File extension not allowed: ${extension}`);
        }
        
        return await ipcRenderer.invoke('save-project-file', filePath, data);
    }
};

// Development utilities (only in development mode)
const devAPI = {
    /**
     * Check if running in development mode
     * @returns {boolean} Development mode status
     */
    isDevelopment: () => {
        return process.env.NODE_ENV === 'development';
    },
    
    /**
     * Open developer tools
     */
    openDevTools: () => {
        if (process.env.NODE_ENV === 'development') {
            return ipcRenderer.invoke('open-dev-tools');
        }
        throw new Error('Developer tools only available in development mode');
    }
};

// Main API object
const electronAPI = {
    java: javaAPI,
    system: systemAPI,
    events: eventAPI,
    files: fileAPI,
    dev: devAPI
};

// Expose secure API to renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Security utilities for renderer
const securityUtils = {
    /**
     * Validate file path security
     * @param {string} path - File path to validate
     * @returns {boolean} Path is safe
     */
    isPathSafe: (path) => {
        if (typeof path !== 'string') return false;
        
        // Block path traversal
        if (path.includes('..')) return false;
        
        // Block absolute paths
        if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) return false;
        
        // Block dangerous characters
        if (/[<>:"|?*]/.test(path)) return false;
        
        return true;
    },
    
    /**
     * Sanitize input string
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized input
     */
    sanitize: (input) => {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/[<>]/g, '') // Remove HTML brackets
            .replace(/javascript:/gi, '') // Remove JavaScript protocol
            .replace(/data:/gi, '') // Remove data protocol
            .replace(/vbscript:/gi, '') // Remove VBScript protocol
            .trim();
    }
};

// Expose security utilities
contextBridge.exposeInMainWorld('securityUtils', securityUtils);

// Global error handler for renderer process
window.addEventListener('error', (event) => {
    console.error('Renderer process error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Security monitoring
if (process.env.NODE_ENV === 'production') {
    // Disable console in production
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    
    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Prevent text selection in production (optional)
    // document.addEventListener('selectstart', (e) => {
    //     e.preventDefault();
    // });
}

console.log('Secure preload script loaded successfully');