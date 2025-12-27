/**
 * Secure Main Process for ProjectLibre Electron App
 * 
 * Security Features:
 * - Context isolation enabled
 * - Node integration disabled in renderer
 * - Secure IPC handlers with validation
 * - Content Security Policy (CSP)
 * - Rate limiting
 * - Input validation
 * - Error handling
 */

const { 
    app, 
    BrowserWindow, 
    ipcMain, 
    dialog, 
    shell,
    protocol,
    net
} = require('electron');
const path = require('path');
const fs = require('fs');

// Security configuration
const SECURITY_CONFIG = {
    // Content Security Policy
    CSP: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"], // Temporary for React, remove in production
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", 'ws:', 'wss:'],
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'media-src': ["'self'"],
        'manifest-src': ["'self'"]
    },
    
    // Window security
    WINDOW_CONFIG: {
        webPreferences: {
            nodeIntegration: false,              // Disable Node.js integration
            nodeIntegrationInWorker: false,       // Disable Node in workers
            contextIsolation: true,              // Enable context isolation
            enableRemoteModule: false,           // Disable remote module
            webSecurity: true,                  // Enable web security
            allowRunningInsecureContent: false,  // Block insecure content
            experimentalFeatures: false,          // Disable experimental features
            sandbox: false,                     // Enable sandbox (when compatible with Java)
            preload: path.join(__dirname, 'SecurePreload.js'),
            webviewTag: false,                  // Disable webview tag
            plugins: false,                      // Disable plugins
            javascript: true,                    // Enable JavaScript
            images: true,                        // Enable images
            textAreasAreResizable: false,         // Disable textarea resizing
            webgl: false,                       // Disable WebGL
            webaudio: false                      // Disable WebAudio
        }
    },
    
    // IPC security
    IPC_CONFIG: {
        timeout: 30000,                       // 30 seconds timeout
        maxRetries: 3,                        // Maximum retry attempts
        maxPayloadSize: 10 * 1024 * 1024,     // 10MB max payload
        allowedOrigins: ['*']                   // Will be restricted in production
    }
};

// Rate limiting for IPC calls
const rateLimiter = new Map();

function checkRateLimit(channel, source) {
    const limits = {
        'java-execute': { max: 10, window: 5000 },     // 10 calls per 5 seconds
        'get-app-version': { max: 5, window: 1000 },    // 5 calls per second
        'show-message-box': { max: 3, window: 1000 },    // 3 calls per second
        'open-external': { max: 2, window: 5000 },        // 2 calls per 5 seconds
        'read-project-file': { max: 5, window: 2000 },    // 5 calls per 2 seconds
        'save-project-file': { max: 3, window: 2000 }     // 3 calls per 2 seconds
    };
    
    const limit = limits[channel];
    if (!limit) return true;
    
    const now = Date.now();
    const key = `${channel}:${source}`;
    const calls = rateLimiter.get(key) || [];
    
    // Clean old calls
    const validCalls = calls.filter(call => now - call < limit.window);
    
    if (validCalls.length >= limit.max) {
        console.warn(`Rate limit exceeded for channel: ${channel} from ${source}`);
        return false;
    }
    
    validCalls.push(now);
    rateLimiter.set(key, validCalls);
    return true;
}

// Input validation
function validateIpcInput(data, schema) {
    if (schema.required && data === undefined) {
        throw new Error(`Required field missing: ${schema.required}`);
    }
    
    if (data === undefined && !schema.required) {
        return true;
    }
    
    if (schema.type && typeof data !== schema.type) {
        throw new Error(`Invalid type: expected ${schema.type}, got ${typeof data}`);
    }
    
    if (schema.maxLength && (typeof data === 'string' && data.length > schema.maxLength)) {
        throw new Error(`Input too long: maximum ${schema.maxLength} characters`);
    }
    
    if (schema.minLength && (typeof data === 'string' && data.length < schema.minLength)) {
        throw new Error(`Input too short: minimum ${schema.minLength} characters`);
    }
    
    if (schema.pattern && schema.pattern.test && !schema.pattern.test(data)) {
        throw new Error(`Invalid format: does not match required pattern`);
    }
    
    if (schema.allowedValues && !schema.allowedValues.includes(data)) {
        throw new Error(`Invalid value: not in allowed list`);
    }
    
    if (schema.min !== undefined && data < schema.min) {
        throw new Error(`Value too small: minimum ${schema.min}`);
    }
    
    if (schema.max !== undefined && data > schema.max) {
        throw new Error(`Value too large: maximum ${schema.max}`);
    }
    
    return true;
}

// Window manager class
class SecureWindowManager {
    constructor() {
        this.mainWindow = null;
        this.windowStates = new Map();
    }
    
    createMainWindow() {
        const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
        
        const windowConfig = {
            width: Math.min(1400, width - 100),
            height: Math.min(900, height - 100),
            minWidth: 1024,
            minHeight: 768,
            show: false,
            autoHideMenuBar: true,
            ...SECURITY_CONFIG.WINDOW_CONFIG,
            icon: this.getAppIconPath(),
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
        };
        
        this.mainWindow = new BrowserWindow(windowConfig);
        this.setupWindowEvents();
        this.loadContent();
        
        return this.mainWindow;
    }
    
    setupWindowEvents() {
        if (!this.mainWindow) return;
        
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
            this.mainWindow?.focus();
            
            if (process.env.NODE_ENV === 'development') {
                this.mainWindow?.webContents.openDevTools();
            }
        });
        
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
        
        // Security: Block new windows
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            // Validate URL before opening
            try {
                const urlObj = new URL(url);
                
                // Only allow HTTP/HTTPS
                if (!['http:', 'https:'].includes(urlObj.protocol)) {
                    console.warn('Blocked protocol:', urlObj.protocol);
                    return { action: 'deny' };
                }
                
                // Block localhost in production
                if (process.env.NODE_ENV === 'production') {
                    const hostname = urlObj.hostname.toLowerCase();
                    if (hostname === 'localhost' || hostname === '127.0.0.1') {
                        console.warn('Blocked localhost access');
                        return { action: 'deny' };
                    }
                }
                
                shell.openExternal(url);
                return { action: 'deny' };
                
            } catch (error) {
                console.error('URL validation error:', error);
                return { action: 'deny' };
            }
        });
        
        // Security: Block navigation to external sites
        this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
            const parsedUrl = new URL(navigationUrl);
            
            // Allow only same origin navigation
            if (parsedUrl.origin !== this.getOrigin()) {
                event.preventDefault();
                console.warn('Blocked navigation to:', navigationUrl);
            }
        });
        
        // Security: Set CSP
        this.mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            const csp = Object.entries(SECURITY_CONFIG.CSP)
                .map(([key, values]) => `${key} ${values.join(' ')}`)
                .join('; ');
                
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [csp],
                    'X-Content-Type-Options': ['nosniff'],
                    'X-Frame-Options': ['DENY'],
                    'X-XSS-Protection': ['1; mode=block']
                }
            });
        });
    }
    
    loadContent() {
        if (!this.mainWindow) return;
        
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.loadURL('http://localhost:3000');
        } else {
            this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        }
    }
    
    getOrigin() {
        if (process.env.NODE_ENV === 'development') {
            return 'http://localhost:3000';
        }
        return 'file://';
    }
    
    getAppIconPath() {
        const iconFormats = {
            win32: 'icon.ico',
            darwin: 'icon.icns',
            linux: 'icon.png'
        };
        
        const iconFile = iconFormats[process.platform];
        if (!iconFile) return undefined;
        
        return path.join(__dirname, '../../assets', iconFile);
    }
    
    getMainWindow() {
        return this.mainWindow;
    }
    
    hasMainWindow() {
        return this.mainWindow !== null && !this.mainWindow.isDestroyed();
    }
}

// Main application class
class SecureProjectLibreApp {
    constructor() {
        this.windowManager = new SecureWindowManager();
        this.setupEventHandlers();
        this.setupSecureIpcHandlers();
    }
    
    setupEventHandlers() {
        app.whenReady().then(() => this.onReady());
        app.on('window-all-closed', () => this.onAllWindowsClosed());
        app.on('activate', () => this.onActivate());
        app.on('before-quit', () => this.onBeforeQuit());
        
        // Security: Block certificate errors in production
        app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
            if (process.env.NODE_ENV === 'production') {
                event.preventDefault();
                callback(false);
            } else {
                callback(true);
            }
        });
    }
    
    async onReady() {
        try {
            this.windowManager.createMainWindow();
            this.setupAppMenu();
        } catch (error) {
            this.handleError(error);
        }
    }
    
    onAllWindowsClosed() {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }
    
    onActivate() {
        if (this.windowManager.getMainWindow() === null) {
            this.windowManager.createMainWindow();
        }
    }
    
    onBeforeQuit() {
        // Cleanup operations
        rateLimiter.clear();
    }
    
    setupAppMenu() {
        // Create secure application menu
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open Project',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => this.handleOpenProject()
                    },
                    {
                        label: 'Save Project',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => this.handleSaveProject()
                    },
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => app.quit()
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: () => this.handleAbout()
                    }
                ]
            }
        ];
        
        const Menu = require('electron').Menu;
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }
    
    setupSecureIpcHandlers() {
        // Java execution with security
        ipcMain.handle('java-execute', async (event, command, args) => {
            const source = event.sender.getFrameId();
            
            if (!checkRateLimit('java-execute', source)) {
                throw new Error('Rate limit exceeded');
            }
            
            try {
                // Validate command
                validateIpcInput(command, {
                    type: 'string',
                    required: true,
                    maxLength: 100,
                    pattern: /^[a-zA-Z0-9_\-\.]+$/
                });
                
                // Validate arguments
                validateIpcInput(args, {
                    type: 'object',
                    required: false
                });
                
                if (Array.isArray(args)) {
                    args.forEach((arg, index) => {
                        validateIpcInput(arg, {
                            type: 'string',
                            required: true,
                            maxLength: 500
                        });
                    });
                }
                
                // Execute Java command (placeholder for actual implementation)
                console.log('Executing Java command:', command, args);
                return { success: true, data: 'Command executed' };
                
            } catch (error) {
                console.error('Java execution error:', error);
                throw new Error('Java execution failed');
            }
        });
        
        // App version
        ipcMain.handle('get-app-version', () => {
            return app.getVersion();
        });
        
        // Secure message box
        ipcMain.handle('show-message-box', async (event, options) => {
            const source = event.sender.getFrameId();
            
            if (!checkRateLimit('show-message-box', source)) {
                throw new Error('Rate limit exceeded');
            }
            
            try {
                validateIpcInput(options, { type: 'object', required: true });
                
                if (options.message) {
                    validateIpcInput(options.message, {
                        type: 'string',
                        maxLength: 1000
                    });
                }
                
                if (options.title) {
                    validateIpcInput(options.title, {
                        type: 'string',
                        maxLength: 100
                    });
                }
                
                const allowedTypes = ['info', 'warning', 'error', 'question'];
                if (options.type && !allowedTypes.includes(options.type)) {
                    throw new Error('Invalid message box type');
                }
                
                return await dialog.showMessageBox(options);
                
            } catch (error) {
                console.error('Message box error:', error);
                throw error;
            }
        });
        
        // Secure external URL opening
        ipcMain.handle('open-external', async (event, url) => {
            const source = event.sender.getFrameId();
            
            if (!checkRateLimit('open-external', source)) {
                throw new Error('Rate limit exceeded');
            }
            
            try {
                validateIpcInput(url, {
                    type: 'string',
                    required: true,
                    maxLength: 2048,
                    pattern: /^https?:\/\/.+/
                });
                
                // Additional URL validation
                const urlObj = new URL(url);
                const allowedProtocols = ['http:', 'https:'];
                
                if (!allowedProtocols.includes(urlObj.protocol)) {
                    throw new Error('Protocol not allowed');
                }
                
                if (process.env.NODE_ENV === 'production') {
                    const hostname = urlObj.hostname.toLowerCase();
                    
                    // Block localhost in production
                    if (hostname === 'localhost' || hostname === '127.0.0.1') {
                        throw new Error('Localhost access not allowed');
                    }
                    
                    // Block private IP ranges
                    const privateIPs = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
                    if (privateIPs.test(hostname)) {
                        throw new Error('Private IP access not allowed');
                    }
                }
                
                await shell.openExternal(url);
                return { success: true };
                
            } catch (error) {
                console.error('External URL error:', error);
                throw error;
            }
        });
        
        // File operations
        ipcMain.handle('read-project-file', async (event, filePath) => {
            try {
                validateIpcInput(filePath, {
                    type: 'string',
                    required: true,
                    maxLength: 500
                });
                
                // Validate file extension
                const allowedExtensions = ['.pod', '.mpp', '.xml', '.xer', '.mpx'];
                const extension = path.extname(filePath).toLowerCase();
                
                if (!allowedExtensions.includes(extension)) {
                    throw new Error('File extension not allowed');
                }
                
                // Check if file exists and is readable
                if (!fs.existsSync(filePath)) {
                    throw new Error('File does not exist');
                }
                
                const stats = fs.statSync(filePath);
                if (!stats.isFile()) {
                    throw new Error('Not a file');
                }
                
                // Size limit
                if (stats.size > SECURITY_CONFIG.IPC_CONFIG.maxPayloadSize) {
                    throw new Error('File too large');
                }
                
                // Read file
                const data = fs.readFileSync(filePath, 'utf-8');
                return { success: true, data };
                
            } catch (error) {
                console.error('File read error:', error);
                throw error;
            }
        });
        
        // Development tools (development only)
        ipcMain.handle('open-dev-tools', (event) => {
            if (process.env.NODE_ENV === 'development') {
                event.sender.openDevTools();
                return { success: true };
            }
            throw new Error('Developer tools only available in development mode');
        });
    }
    
    async handleOpenProject() {
        const result = await dialog.showOpenDialog(this.windowManager.getMainWindow(), {
            properties: ['openFile'],
            filters: [
                { name: 'Project Files', extensions: ['pod', 'mpp', 'xml', 'xer', 'mpx'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            // Send file path to renderer
            this.windowManager.getMainWindow().webContents.send('project-file-selected', result.filePaths[0]);
        }
    }
    
    async handleSaveProject() {
        const result = await dialog.showSaveDialog(this.windowManager.getMainWindow(), {
            filters: [
                { name: 'ProjectLibre', extensions: ['pod'] },
                { name: 'XML', extensions: ['xml'] },
                { name: 'XER', extensions: ['xer'] }
            ]
        });
        
        if (!result.canceled && result.filePath) {
            // Send save path to renderer
            this.windowManager.getMainWindow().webContents.send('project-file-save', result.filePath);
        }
    }
    
    handleAbout() {
        dialog.showMessageBox(this.windowManager.getMainWindow(), {
            type: 'info',
            title: 'About ProjectLibre',
            message: 'ProjectLibre',
            detail: `Version: ${app.getVersion()}\nElectron-based project management software`
        });
    }
    
    handleError(error) {
        console.error('Application error:', error);
        
        if (this.windowManager.hasMainWindow()) {
            dialog.showErrorBox('ProjectLibre Error', error.message);
        }
        
        app.quit();
    }
}

// Application startup
try {
    new SecureProjectLibreApp();
} catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
}