"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaLauncher = void 0;
const child_process_1 = require("child_process");
const IJavaLauncher_1 = require("./interfaces/IJavaLauncher");
const JreManager_1 = require("./JreManager");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Сервис запуска Java приложений
 * Реализует интерфейс IJavaLauncher согласно принципам Clean Architecture
 * Следует принципу Single Responsibility из SOLID
 */
class JavaLauncher {
    jreManager;
    activeProcesses;
    constructor() {
        this.jreManager = new JreManager_1.JreManager();
        this.activeProcesses = new Map();
    }
    /**
     * Запускает JAR файл
     */
    async launchJar(jarPath, args = [], options = {}) {
        try {
            if (!fs.existsSync(jarPath)) {
                return {
                    success: false,
                    errorMessage: `JAR file not found: ${jarPath}`,
                    errorCode: -1
                };
            }
            const javaPath = await this.jreManager.getJavaExecutablePath();
            if (!javaPath) {
                return {
                    success: false,
                    errorMessage: 'Java executable not found',
                    errorCode: -2
                };
            }
            const javaArgs = this.buildJarArgs(jarPath, args, options);
            return await this.launchJavaProcess(javaPath, javaArgs, options);
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorCode: -3
            };
        }
    }
    /**
     * Запускает Java класс
     */
    async launchClass(className, classpath, args = [], options = {}) {
        try {
            const javaPath = await this.jreManager.getJavaExecutablePath();
            if (!javaPath) {
                return {
                    success: false,
                    errorMessage: 'Java executable not found',
                    errorCode: -2
                };
            }
            const javaArgs = this.buildClassArgs(className, classpath, args, options);
            return await this.launchJavaProcess(javaPath, javaArgs, options);
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorCode: -3
            };
        }
    }
    /**
     * Запускает Java с произвольными аргументами
     */
    async launchCustom(javaArgs, options = {}) {
        try {
            const javaPath = await this.jreManager.getJavaExecutablePath();
            if (!javaPath) {
                return {
                    success: false,
                    errorMessage: 'Java executable not found',
                    errorCode: -2
                };
            }
            return await this.launchJavaProcess(javaPath, javaArgs, options);
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorCode: -3
            };
        }
    }
    /**
     * Останавливает Java процесс
     */
    async stopProcess(process, timeout = 5000) {
        try {
            if (!process || !process.pid) {
                return false;
            }
            const processInfo = this.activeProcesses.get(process.pid);
            if (processInfo) {
                processInfo.state = IJavaLauncher_1.ProcessState.STOPPED;
            }
            process.kill('SIGTERM');
            return new Promise((resolve) => {
                const forceKill = setTimeout(() => {
                    if (!process.killed) {
                        process.kill('SIGKILL');
                        if (processInfo) {
                            processInfo.state = IJavaLauncher_1.ProcessState.KILLED;
                        }
                    }
                    resolve(false);
                }, timeout);
                process.on('close', () => {
                    clearTimeout(forceKill);
                    resolve(true);
                });
            });
        }
        catch {
            return false;
        }
    }
    /**
     * Проверяет состояние процесса
     */
    getProcessState(process) {
        if (!process || !process.pid) {
            return IJavaLauncher_1.ProcessState.NOT_STARTED;
        }
        const processInfo = this.activeProcesses.get(process.pid);
        return processInfo ? processInfo.state : IJavaLauncher_1.ProcessState.NOT_STARTED;
    }
    /**
     * Получает информацию о запущенном процессе
     */
    getProcessInfo(process) {
        if (!process || !process.pid) {
            return null;
        }
        return this.activeProcesses.get(process.pid) || null;
    }
    /**
     * Запускает Java процесс с настройками
     */
    async launchWithConfig(config, eventHandlers) {
        try {
            const args = [];
            if (config.options?.memory) {
                if (config.options.memory.min) {
                    args.push(`-Xms${config.options.memory.min}m`);
                }
                if (config.options.memory.max) {
                    args.push(`-Xmx${config.options.memory.max}m`);
                }
            }
            if (config.options?.jvmOptions) {
                args.push(...config.options.jvmOptions);
            }
            if (config.jarPath) {
                args.push('-jar', config.jarPath);
            }
            else if (config.mainClass && config.classpath) {
                args.push('-cp', config.classpath, config.mainClass);
            }
            if (config.args) {
                args.push(...config.args);
            }
            const result = await this.launchJavaProcess(config.javaPath, args, config.options || {});
            if (result.success && result.process && eventHandlers) {
                this.setupEventHandlers(result.process, eventHandlers);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorCode: -3
            };
        }
    }
    /**
     * Запускает Java процесс
     */
    async launchJavaProcess(javaPath, args, options) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let stdout = '';
            let stderr = '';
            const childProcess = (0, child_process_1.spawn)(javaPath, args, {
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env },
                stdio: options.redirectOutput ? ['ignore', 'pipe', 'pipe'] : 'ignore',
                windowsHide: true
            });
            const timeoutId = options.timeout ? setTimeout(() => {
                childProcess.kill();
                resolve({
                    success: false,
                    errorMessage: `Process timeout after ${options.timeout}ms`,
                    errorCode: -4
                });
            }, options.timeout) : null;
            childProcess.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            childProcess.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            childProcess.on('spawn', () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                const processInfo = {
                    pid: childProcess.pid,
                    state: IJavaLauncher_1.ProcessState.RUNNING,
                    startTime,
                    uptime: 0,
                    restartCount: 0
                };
                this.activeProcesses.set(childProcess.pid, processInfo);
                resolve({
                    success: true,
                    process: childProcess,
                    pid: childProcess.pid,
                    startTime,
                    stdout: options.redirectOutput ? stdout : undefined,
                    stderr: options.redirectOutput ? stderr : undefined
                });
            });
            childProcess.on('error', (error) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve({
                    success: false,
                    errorMessage: error.message,
                    errorCode: -5,
                    stdout: options.redirectOutput ? stdout : undefined,
                    stderr: options.redirectOutput ? stderr : undefined
                });
            });
            childProcess.on('close', (code, signal) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                const processInfo = this.activeProcesses.get(childProcess.pid);
                if (processInfo) {
                    processInfo.state = code === 0 ? IJavaLauncher_1.ProcessState.STOPPED : IJavaLauncher_1.ProcessState.ERROR;
                    processInfo.lastExitCode = code || undefined;
                    processInfo.lastError = signal || undefined;
                }
                this.activeProcesses.delete(childProcess.pid);
            });
        });
    }
    /**
     * Строит аргументы для запуска JAR
     */
    buildJarArgs(jarPath, args, options) {
        const javaArgs = [];
        if (options.memory) {
            if (options.memory.min) {
                javaArgs.push(`-Xms${options.memory.min}m`);
            }
            if (options.memory.max) {
                javaArgs.push(`-Xmx${options.memory.max}m`);
            }
        }
        if (options.jvmOptions) {
            javaArgs.push(...options.jvmOptions);
        }
        javaArgs.push('-jar', path.resolve(jarPath));
        javaArgs.push(...args);
        return javaArgs;
    }
    /**
     * Строит аргументы для запуска класса
     */
    buildClassArgs(className, classpath, args, options) {
        const javaArgs = [];
        if (options.memory) {
            if (options.memory.min) {
                javaArgs.push(`-Xms${options.memory.min}m`);
            }
            if (options.memory.max) {
                javaArgs.push(`-Xmx${options.memory.max}m`);
            }
        }
        if (options.jvmOptions) {
            javaArgs.push(...options.jvmOptions);
        }
        javaArgs.push('-cp', classpath, className);
        javaArgs.push(...args);
        return javaArgs;
    }
    /**
     * Устанавливает обработчики событий процесса
     */
    setupEventHandlers(process, handlers) {
        if (handlers.onStart) {
            handlers.onStart(process);
        }
        if (handlers.onStop) {
            process.on('close', (code, signal) => {
                handlers.onStop(code, signal);
            });
        }
        if (handlers.onError) {
            process.on('error', handlers.onError);
        }
        if (handlers.onOutput) {
            process.stdout?.on('data', (data) => {
                handlers.onOutput(data.toString(), 'stdout');
            });
            process.stderr?.on('data', (data) => {
                handlers.onOutput(data.toString(), 'stderr');
            });
        }
    }
    /**
     * Получает все активные процессы
     */
    getActiveProcesses() {
        return Array.from(this.activeProcesses.values());
    }
    /**
     * Останавливает все активные процессы
     */
    async stopAllProcesses() {
        const promises = Array.from(this.activeProcesses.keys()).map(pid => {
            const processInfo = this.activeProcesses.get(pid);
            if (processInfo) {
                return this.stopProcess({ pid, kill: () => { } });
            }
            return Promise.resolve(false);
        });
        return Promise.all(promises);
    }
}
exports.JavaLauncher = JavaLauncher;
//# sourceMappingURL=JavaLauncher.js.map