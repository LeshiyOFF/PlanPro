
import { app, BrowserWindow } from 'electron';
import { IAppBootstrapper, BootstrappingStatus } from './interfaces/IAppBootstrapper';
import { JavaBridgeService } from './JavaBridgeService';
import { IWindowManager } from './interfaces/IWindowManager';
import { BootstrapErrorHandler } from './handlers/BootstrapErrorHandler';

/**
 * Класс управления последовательностью запуска приложения (Bootstrapping Flow)
 * Реализует цепочку: app.ready -> Java.start -> Health.wait -> Window.create
 * Соответствует SOLID: Single Responsibility Principle
 */
export class AppBootstrapper implements IAppBootstrapper {
  private status: BootstrappingStatus = BootstrappingStatus.IDLE;
  private readonly javaBridge: JavaBridgeService;
  private readonly windowManager: IWindowManager;

  constructor(javaBridge: JavaBridgeService, windowManager: IWindowManager) {
    this.javaBridge = javaBridge;
    this.windowManager = windowManager;
  }

  /**
   * Основной метод запуска цепочки инициализации
   */
  public async bootstrap(): Promise<void> {
    try {
      console.log('[Bootstrapper] Starting application bootstrap sequence...');
      
      this.updateStatus(BootstrappingStatus.IDLE);

      // 1. Ожидание готовности Electron (app.whenReady)
      await app.whenReady();
      console.log('[Bootstrapper] Electron app is ready.');

      // 1.1 Показ splash сразу, до запуска Java
      this.windowManager.showSplash();

      // 2. Запуск Java Backend
      this.updateStatus(BootstrappingStatus.STARTING_JAVA);
      await this.javaBridge.initialize();
      console.log('[Bootstrapper] Java bridge initialization started.');

      // 3. Ожидание готовности API (Health Check)
      this.updateStatus(BootstrappingStatus.WAITING_FOR_API);
      const TIMEOUT_MS = 120000;
      const isApiReady = await this.waitForJavaApi(TIMEOUT_MS);
      
      if (!isApiReady) {
        throw new Error(`Java API failed to become ready within timeout (${TIMEOUT_MS / 1000}s).`);
      }

      // 4. Создание главного окна
      this.updateStatus(BootstrappingStatus.READY);
      this.windowManager.createMainWindow();
      console.log('[Bootstrapper] Application bootstrap sequence completed successfully.');
      
    } catch (error) {
      this.updateStatus(BootstrappingStatus.FAILED);
      BootstrapErrorHandler.handleFatalError(error as Error);
    }
  }

  /**
   * Обновление статуса и уведомление UI
   */
  private updateStatus(newStatus: BootstrappingStatus): void {
    this.status = newStatus;
    console.log(`[Bootstrapper] Status changed: ${newStatus}`);
    
    // Отправка события во все окна (если они уже есть, например splash screen)
    BrowserWindow.getAllWindows().forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send('bootstrap-status-change', newStatus);
      }
    });
  }

  /**
   * Получение текущего статуса
   */
  public getInitializationStatus(): BootstrappingStatus {
    return this.status;
  }

  /**
   * Ожидание готовности Java API с расширенным логированием
   */
  private async waitForJavaApi(timeoutMs: number = 120000): Promise<boolean> {
    const apiClient = this.javaBridge.getApiClient();
    const INTERVAL_MS = 1500;
    const startTime = Date.now();
    
    console.log(`[Bootstrapper] Waiting for Java API to respond (timeout: ${timeoutMs}ms)...`);
    console.log(`[Bootstrapper] Java process status: ${this.javaBridge.getStatus()}`);
    console.log(`[Bootstrapper] Java PID: ${this.javaBridge.getProcessManager().getPid()}`);
    
    const result = await apiClient.waitForReady(timeoutMs, INTERVAL_MS);
    
    const elapsed = Date.now() - startTime;
    if (result) {
      console.log(`✅ [Bootstrapper] Java API is ready! (took ${elapsed}ms)`);
    } else {
      console.error(`❌ [Bootstrapper] Java API did not respond after ${elapsed}ms`);
      console.error(`[Bootstrapper] Final Java status: ${this.javaBridge.getStatus()}`);
      const error = this.javaBridge.getProcessManager().getError();
      if (error) {
        console.error(`[Bootstrapper] Java error: ${error.message}`);
      }
    }
    
    return result;
  }
}

