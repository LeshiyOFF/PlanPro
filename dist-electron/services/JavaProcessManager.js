"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaProcessManager = void 0;
const child_process_1 = require("child_process");
const events_1 = require("events");
/**
 * Менеджер Java процесса
 * Отвечает только за запуск, остановку и мониторинг Java процесса
 */
class JavaProcessManager extends events_1.EventEmitter {
    javaProcess = null;
    config;
    status;
    constructor(config) {
        super();
        this.config = config;
        this.status = {
            running: false,
            port: this.config.getJavaApiPort()
        };
    }
    /**
     * Запуск Java процесса
     */
    async start() {
        return new Promise((resolve, reject) => {
            const javaExecutable = this.config.getJavaExecutablePath();
            const jarPath = this.config.getProjectLibreJarPath();
            const javaArgs = [
                '-jar', jarPath,
                '--server.port=' + this.status.port,
                '--spring.profiles.active=electron'
            ];
            this.javaProcess = (0, child_process_1.spawn)(javaExecutable, javaArgs, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PROJECTLIBRE_MODE: 'electron'
                }
            });
            if (!this.javaProcess.pid) {
                reject(new Error('Failed to start Java process'));
                return;
            }
            this.status.pid = this.javaProcess.pid;
            this.setupProcessHandlers(resolve, reject);
        });
    }
    /**
     * Остановка Java процесса
     */
    async stop() {
        if (this.javaProcess) {
            this.javaProcess.kill('SIGTERM');
            await new Promise((resolve) => {
                if (this.javaProcess) {
                    this.javaProcess.once('close', () => resolve());
                }
                else {
                    resolve();
                }
            });
        }
        this.status.running = false;
        this.javaProcess = null;
    }
    /**
     * Проверка работает ли процесс
     */
    isRunning() {
        return this.status.running && this.javaProcess !== null && !this.javaProcess.killed;
    }
    /**
     * Получение текущего статуса
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Настройка обработчиков событий процесса
     */
    setupProcessHandlers(resolve, reject) {
        if (!this.javaProcess)
            return;
        let resolved = false;
        this.javaProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            console.log('Java stdout:', output);
            if (output.includes('Started ProjectLibreApplication') && !resolved) {
                resolved = true;
                this.status.running = true;
                this.status.startTime = new Date();
                this.emit('started');
                resolve();
            }
        });
        this.javaProcess.stderr?.on('data', (data) => {
            const output = data.toString();
            console.error('Java stderr:', output);
            if (!resolved && output.includes('ERROR')) {
                resolved = true;
                reject(new Error(`Java process error: ${output}`));
            }
        });
        this.javaProcess.on('close', (code) => {
            this.status.running = false;
            this.emit('stopped');
            if (code !== 0 && !resolved) {
                resolved = true;
                reject(new Error(`Java process exited with code ${code}`));
            }
        });
        this.javaProcess.on('error', (error) => {
            console.error('Java process error:', error);
            if (!resolved) {
                resolved = true;
                reject(error);
            }
        });
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                reject(new Error('Java process startup timeout'));
            }
        }, 30000);
    }
}
exports.JavaProcessManager = JavaProcessManager;
//# sourceMappingURL=JavaProcessManager.js.map