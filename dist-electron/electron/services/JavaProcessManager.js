"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaProcessManager = void 0;
const events_1 = require("events");
const JavaLauncher_1 = require("./JavaLauncher");
const JavaProcessValidator_1 = require("./JavaProcessValidator");
const CommandLineTester_1 = require("./CommandLineTester");
/**
 * Менеджер Java процесса
 * Следует принципу Single Responsibility из SOLID
 * Использует новые сервисы для управления Java процессами
 */
class JavaProcessManager extends events_1.EventEmitter {
    javaLauncher;
    validator;
    commandLineTester;
    config;
    status = {
        running: false,
        port: 8080,
        pid: null,
        isStarting: false,
        isStopping: false,
        error: null
    };
    constructor(config) {
        super();
        this.config = config;
        this.javaLauncher = new JavaLauncher_1.JavaLauncher();
        this.validator = new JavaProcessValidator_1.JavaProcessValidator();
        this.commandLineTester = new CommandLineTester_1.CommandLineTester();
        this.status.port = this.config.getJavaApiPort();
    }
    /**
     * Запуск Java процесса
     */
    async start() {
        try {
            console.log('Starting Java process...');
            const jarPath = this.config.getProjectLibreJarPath();
            console.log('JAR path:', jarPath);
            // Валидация конфигурации запуска
            const validation = await this.validator.validateLaunchConfig(jarPath, {
                memory: { min: 512, max: 1024 },
                timeout: 30000,
                env: {
                    PROJECTLIBRE_MODE: 'electron',
                    SPRING_PROFILES_ACTIVE: 'electron'
                }
            });
            if (!validation.isValid) {
                throw new Error(validation.errorMessage || 'Java launch validation failed');
            }
            const launchOptions = {
                memory: { min: 512, max: 1024 },
                timeout: 30000,
                redirectOutput: true,
                env: {
                    PROJECTLIBRE_MODE: 'electron',
                    SPRING_PROFILES_ACTIVE: 'electron'
                },
                jvmOptions: [
                    `-Dserver.port=${this.status.port}`,
                    '-Dspring.profiles.active=electron'
                ]
            };
            this.status.isStarting = true;
            this.emit('status', this.status);
            const result = await this.javaLauncher.launchJar(jarPath, [
                '--server.port=' + this.status.port,
                '--spring.profiles.active=electron'
            ], launchOptions);
            if (!result.success || !result.process) {
                this.status.isStarting = false;
                this.status.error = new Error(result.errorMessage || 'Failed to start Java process');
                this.emit('status', this.status);
                throw new Error(result.errorMessage || 'Failed to start Java process');
            }
            this.status.pid = result.pid || null;
            this.setupProcessHandlers(result.process);
            console.log('Java process started successfully with PID:', result.pid);
        }
        catch (error) {
            this.status.isStarting = false;
            this.status.error = error instanceof Error ? error : new Error('Unknown error');
            this.emit('status', this.status);
            throw error;
        }
    }
    /**
     * Остановка Java процесса
     */
    async stop() {
        if (!this.status.pid) {
            return;
        }
        this.status.isStopping = true;
        this.emit('status', this.status);
        try {
            // Получаем информацию о процессе для остановки
            const processes = this.javaLauncher.getActiveProcesses();
            const currentProcess = processes.find(p => p.pid === this.status.pid);
            if (currentProcess) {
                // Создаем моковый процесс для остановки (в реальной реализации нужно хранить ссылки)
                const mockProcess = {
                    pid: this.status.pid,
                    kill: () => { }
                };
                const stopped = await this.javaLauncher.stopProcess(mockProcess, 10000);
                if (stopped) {
                    this.status.running = false;
                    this.status.isStopping = false;
                    this.status.pid = null;
                    this.emit('stopped');
                    this.emit('status', this.status);
                }
                else {
                    throw new Error('Failed to stop Java process gracefully');
                }
            }
        }
        catch (error) {
            this.status.error = error instanceof Error ? error : new Error('Stop failed');
            this.emit('status', this.status);
            throw error;
        }
    }
    /**
     * Получение статуса
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Проверка доступности Java процесса
     */
    async checkHealth() {
        return this.status.running && this.status.pid !== null;
    }
    /**
     * Получение порта
     */
    getPort() {
        return this.status.port;
    }
    /**
     * Проверка, запущен ли процесс
     */
    isRunning() {
        return this.status.running;
    }
    /**
     * Настройка обработчиков событий процесса
     */
    setupProcessHandlers(process) {
        if (!process) {
            return;
        }
        const eventHandlers = {
            onStart: (proc) => {
                console.log('Java process started with PID:', proc.pid);
                this.status.running = true;
                this.status.isStarting = false;
                this.emit('started');
                this.emit('status', this.status);
            },
            onStop: (code, signal) => {
                console.log(`Java process stopped with code ${code}, signal ${signal}`);
                this.status.running = false;
                this.status.isStarting = false;
                this.status.isStopping = false;
                this.status.pid = null;
                this.emit('stopped');
                this.emit('status', this.status);
            },
            onError: (error) => {
                console.error('Java process error:', error);
                this.status.isStarting = false;
                this.status.error = error;
                this.emit('status', this.status);
            },
            onOutput: (data, type) => {
                if (type === 'stdout') {
                    console.log(`Java stdout: ${data}`);
                }
                else {
                    console.log(`Java stderr: ${data}`);
                }
            }
        };
        // Устанавливаем обработчики через JavaLauncher
        this.javaLauncher.launchWithConfig({
            javaPath: '', // Будет определен в JavaLauncher
            jarPath: this.config.getProjectLibreJarPath()
        }, eventHandlers);
    }
    /**
     * Запуск командной строки тестирования
     */
    async runCommandLineTest() {
        try {
            console.log('Running command line Java test...');
            const testResult = await this.commandLineTester.runFullCommandLineTest({
                jarPath: this.config.getProjectLibreJarPath(),
                testSystemJava: true,
                testEmbeddedJre: true,
                verbose: true,
                testTimeout: 15000
            });
            console.log('Command line test completed:', testResult);
            if (testResult.success) {
                this.emit('test-completed', testResult);
            }
            else {
                this.emit('test-failed', testResult);
            }
            const report = this.commandLineTester.generateTestReport(testResult);
            console.log('Test Report:\n', report);
        }
        catch (error) {
            console.error('Command line test failed:', error);
            this.emit('test-failed', error);
        }
    }
    /**
     * Получение информации о JRE
     */
    async getJreInfo() {
        return await this.config.getJreInfo();
    }
    /**
     * Проверка доступности JRE
     */
    async isJreAvailable() {
        return await this.config.isJreAvailable();
    }
}
exports.JavaProcessManager = JavaProcessManager;
//# sourceMappingURL=JavaProcessManager.js.map