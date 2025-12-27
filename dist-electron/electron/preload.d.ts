/**
 * Экспортируемый API для renderer процесса
 * Безопасный мост между main и renderer процессами
 */
export interface ElectronAPI {
    javaExecute: (command: string, args?: string[]) => Promise<any>;
    getAppVersion: () => Promise<string>;
    showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
    openExternal: (url: string) => Promise<void>;
    onJavaStarted: (callback: () => void) => void;
    onJavaStopped: (callback: () => void) => void;
    onJavaError: (callback: (error: Error) => void) => void;
    removeAllListeners: (channel: string) => void;
}
/**
 * Определение типов для TypeScript
 */
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
/**
 * Вспомогательные утилиты для renderer процесса
 */
declare const utils: {
    /**
     * Получение информации о приложении
     */
    getAppInfo(): Promise<{
        version: string;
        platform: string;
    }>;
};
/**
 * Определение типов утилит
 */
declare global {
    interface Window {
        appUtils: typeof utils;
    }
}
export {};
