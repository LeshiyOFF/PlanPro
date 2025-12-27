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
exports.EmbeddedJreService = void 0;
const path_1 = require("path");
const fs = __importStar(require("fs"));
const IJreManager_1 = require("./interfaces/IJreManager");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
/**
 * Сервис для работы с встроенным JRE (Java Runtime Environment)
 * Следует принципу Single Responsibility из SOLID
 */
class EmbeddedJreService {
    resourcesPath;
    isDev;
    platform;
    constructor() {
        this.isDev = process.env.NODE_ENV === 'development';
        this.platform = process.platform;
        this.resourcesPath = this.getResourcesPath();
    }
    /**
     * Получает путь к ресурсам приложения
     */
    getResourcesPath() {
        if (this.isDev) {
            return (0, path_1.join)(__dirname, '../../resources');
        }
        return process.resourcesPath || (0, path_1.join)(process.execPath, '..', 'resources');
    }
    /**
     * Проверяет наличие встроенного JRE
     */
    async isEmbeddedJreAvailable() {
        const javaPath = await this.getEmbeddedJavaPath();
        return javaPath !== null;
    }
    /**
     * Получает путь к встроенному Java
     */
    async getEmbeddedJavaPath() {
        const jrePath = this.getEmbeddedJrePath();
        if (!jrePath || !fs.existsSync(jrePath)) {
            return null;
        }
        const executableName = this.getJavaExecutableName();
        const javaPath = (0, path_1.join)(jrePath, 'bin', executableName);
        return fs.existsSync(javaPath) ? javaPath : null;
    }
    /**
     * Получает путь к директории встроенного JRE
     */
    getEmbeddedJrePath() {
        const possiblePaths = [
            (0, path_1.join)(this.resourcesPath, 'jre'),
            (0, path_1.join)(this.resourcesPath, 'java'),
            (0, path_1.join)(this.resourcesPath, 'runtime'),
            (0, path_1.join)(this.resourcesPath, 'jvm')
        ];
        // Платформо-специфичные пути
        if (this.platform === 'win32') {
            possiblePaths.push((0, path_1.join)(this.resourcesPath, 'jre', 'win'), (0, path_1.join)(this.resourcesPath, 'java', 'windows'));
        }
        else if (this.platform === 'darwin') {
            possiblePaths.push((0, path_1.join)(this.resourcesPath, 'jre', 'macos'), (0, path_1.join)(this.resourcesPath, 'java', 'macos'), (0, path_1.join)(this.resourcesPath, 'jre', 'Contents', 'Home'));
        }
        else {
            possiblePaths.push((0, path_1.join)(this.resourcesPath, 'jre', 'linux'), (0, path_1.join)(this.resourcesPath, 'java', 'linux'));
        }
        for (const path of possiblePaths) {
            if (fs.existsSync(path)) {
                return path;
            }
        }
        return null;
    }
    /**
     * Получает имя исполняемого файла Java для текущей платформы
     */
    getJavaExecutableName() {
        switch (this.platform) {
            case 'win32':
                return 'java.exe';
            case 'darwin':
            case 'linux':
            default:
                return 'java';
        }
    }
    /**
     * Получает информацию о встроенном JRE
     */
    async getEmbeddedJreInfo() {
        const javaPath = await this.getEmbeddedJavaPath();
        if (!javaPath) {
            return null;
        }
        try {
            const version = await this.getJavaVersion(javaPath);
            const homePath = (0, path_1.dirname)(javaPath);
            const architecture = await this.getJavaArchitecture(javaPath);
            return {
                executablePath: javaPath,
                version: version || 'unknown',
                type: IJreManager_1.JreType.EMBEDDED,
                homePath,
                architecture: architecture || 'unknown',
                isValid: await this.validateEmbeddedJre(javaPath)
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Получает версию Java
     */
    async getJavaVersion(javaPath) {
        try {
            const { stderr } = await execFileAsync(javaPath, ['-version'], {
                windowsHide: true,
                timeout: 5000
            });
            const match = stderr.match(/version "([^"]+)"/);
            return match && match[1] ? match[1] : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Получает архитектуру Java
     */
    async getJavaArchitecture(javaPath) {
        try {
            const { stdout } = await execFileAsync(javaPath, ['-XshowSettings:properties', '-version'], {
                windowsHide: true,
                timeout: 5000
            });
            const osArchMatch = stdout.match(/os\.arch\s*=\s*(.+)/i);
            return osArchMatch && osArchMatch[1] ? osArchMatch[1].trim() : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Валидирует встроенное JRE
     */
    async validateEmbeddedJre(javaPath) {
        const pathToValidate = javaPath || await this.getEmbeddedJavaPath();
        if (!pathToValidate) {
            return false;
        }
        try {
            // Проверяем запуск Java
            await execFileAsync(pathToValidate, ['-version'], {
                windowsHide: true,
                timeout: 5000
            });
            // Проверяем наличие необходимых библиотек
            return await this.validateJreLibraries(pathToValidate);
        }
        catch {
            return false;
        }
    }
    /**
     * Валидирует наличие необходимых библиотек JRE
     */
    async validateJreLibraries(javaPath) {
        const jreHome = (0, path_1.dirname)((0, path_1.dirname)(javaPath));
        const libPath = (0, path_1.join)(jreHome, 'lib');
        if (!fs.existsSync(libPath)) {
            return false;
        }
        const requiredFiles = this.getRequiredJreFiles();
        for (const file of requiredFiles) {
            const filePath = (0, path_1.join)(libPath, file);
            if (!fs.existsSync(filePath)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Получает список необходимых файлов JRE для текущей платформы
     */
    getRequiredJreFiles() {
        if (this.platform === 'win32') {
            return ['rt.jar', 'jsse.jar'];
        }
        else if (this.platform === 'darwin') {
            return ['rt.jar', 'jsse.jar', 'jce.jar'];
        }
        else {
            return ['rt.jar', 'jsse.jar', 'jce.jar'];
        }
    }
    /**
     * Создает структуру директорий для встроенного JRE
     */
    async createEmbeddedJreStructure() {
        try {
            const jrePath = (0, path_1.join)(this.resourcesPath, 'jre');
            const binPath = (0, path_1.join)(jrePath, 'bin');
            const libPath = (0, path_1.join)(jrePath, 'lib');
            // Создаем директории
            fs.mkdirSync(binPath, { recursive: true });
            fs.mkdirSync(libPath, { recursive: true });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Проверяет целостность встроенного JRE
     */
    async checkEmbeddedJreIntegrity() {
        const javaPath = await this.getEmbeddedJavaPath();
        if (!javaPath) {
            return false;
        }
        try {
            // Проверяем основные компоненты
            const isValid = await this.validateEmbeddedJre(javaPath);
            if (!isValid) {
                return false;
            }
            // Дополнительная проверка - попытка запустить простую команду
            await execFileAsync(javaPath, ['-help'], {
                windowsHide: true,
                timeout: 3000
            });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Получает размер встроенного JRE в байтах
     */
    async getEmbeddedJreSize() {
        const jrePath = this.getEmbeddedJrePath();
        if (!jrePath || !fs.existsSync(jrePath)) {
            return 0;
        }
        return this.calculateDirectorySize(jrePath);
    }
    /**
     * Рекурсивно вычисляет размер директории
     */
    async calculateDirectorySize(dirPath) {
        let totalSize = 0;
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const item of items) {
                const fullPath = (0, path_1.join)(dirPath, item.name);
                if (item.isFile()) {
                    const stats = fs.statSync(fullPath);
                    totalSize += stats.size;
                }
                else if (item.isDirectory()) {
                    totalSize += await this.calculateDirectorySize(fullPath);
                }
            }
        }
        catch {
            // Игнорируем ошибки доступа
        }
        return totalSize;
    }
    /**
     * Получает информацию о доступном месте на диске
     */
    async getAvailableDiskSpace() {
        try {
            fs.statSync(this.resourcesPath);
            // В Node.js нет прямого способа получить свободное место, возвращаем 0
            // В реальном приложении можно использовать platform-specific решения
            return 0;
        }
        catch {
            return 0;
        }
    }
}
exports.EmbeddedJreService = EmbeddedJreService;
//# sourceMappingURL=EmbeddedJreService.js.map