import { hotkeyService } from './HotkeyService';
import { StatusBarService } from '@/components/statusbar/services/StatusBarService';
import { logger } from '@/utils/logger';

/**
 * Мост между HotkeyService и StatusBarService
 * Обеспечивает UI обратную связь для горячих клавиш
 */

class HotkeyStatusBarBridge {
  private static instance: HotkeyStatusBarBridge;
  private statusBarService: StatusBarService;
  private isInitialized: boolean = false;

  private constructor() {
    this.statusBarService = StatusBarService.getInstance();
  }

  static getInstance(): HotkeyStatusBarBridge {
    if (!HotkeyStatusBarBridge.instance) {
      HotkeyStatusBarBridge.instance = new HotkeyStatusBarBridge();
    }
    return HotkeyStatusBarBridge.instance;
  }

  /**
   * Инициализация моста и подписка на события горячих клавиш
   */
  initialize(): void {
    if (this.isInitialized) {
      logger.dialog('Hotkey-StatusBar bridge already initialized, skipping', {}, 'HotkeyStatusBarBridge');
      return;
    }

    logger.dialog('Setting up hotkey listeners', {}, 'HotkeyStatusBarBridge');
    this.setupHotkeyListeners();
    this.isInitialized = true;
    logger.dialog('Hotkey-StatusBar bridge initialized', {}, 'HotkeyStatusBarBridge');
  }

  /**
   * Настройка слушателей для горячих клавиш
   */
  private setupHotkeyListeners(): void {
    // Файловые операции
    hotkeyService.addEventListener('NEW_PROJECT', () => {
      this.statusBarService.showSuccess('Создан новый проект');
      logger.dialog('New project via hotkey', {}, 'HotkeyStatusBarBridge');
    });

    hotkeyService.addEventListener('OPEN_PROJECT', () => {
      this.statusBarService.showSuccess('Проект открыт');
    });

    hotkeyService.addEventListener('SAVE_PROJECT', () => {
      this.statusBarService.showSuccess('Проект сохранён');
    });

    hotkeyService.addEventListener('SAVE_AS', () => {
      this.statusBarService.showSuccess('Проект сохранен как');
    });

    hotkeyService.addEventListener('PRINT', () => {
      this.statusBarService.showProgress('Подготовка к печати...');
    });

    // Операции с задачами
    hotkeyService.addEventListener('INSERT_TASK', () => {
      this.statusBarService.showMessage('Вставка новой задачи');
    });

    hotkeyService.addEventListener('DELETE_TASK', () => {
      this.statusBarService.showMessage('Задача удалена');
    });

    hotkeyService.addEventListener('FIND_TASK', () => {
      this.statusBarService.showProgress('Поиск задачи...');
    });

    hotkeyService.addEventListener('GOTO_TASK', () => {
      this.statusBarService.showMessage('Переход к задаче');
    });

    // Операции редактирования
    hotkeyService.addEventListener('UNDO', () => {
      this.statusBarService.showMessage('Действие отменено');
    });

    hotkeyService.addEventListener('REDO', () => {
      this.statusBarService.showMessage('Действие повторено');
    });

    hotkeyService.addEventListener('CUT', () => {
      this.statusBarService.showMessage('Вырезано');
    });

    hotkeyService.addEventListener('COPY', () => {
      this.statusBarService.showMessage('Скопировано');
    });

    hotkeyService.addEventListener('PASTE', () => {
      this.statusBarService.showMessage('Вставлено');
    });

    // Операции вида
    hotkeyService.addEventListener('ZOOM_IN', () => {
      this.statusBarService.showMessage('Увеличение масштаба');
    });

    hotkeyService.addEventListener('ZOOM_OUT', () => {
      this.statusBarService.showMessage('Уменьшение масштаба');
    });

    hotkeyService.addEventListener('FIT_TO_WIDTH', () => {
      this.statusBarService.showMessage('По ширине');
    });

    hotkeyService.addEventListener('TASK_INFO', () => {
      this.statusBarService.showMessage('Информация о задаче');
    });

    // Операции с ресурсами
    hotkeyService.addEventListener('ASSIGN_RESOURCES', () => {
      this.statusBarService.showMessage('Назначение ресурсов');
    });

    hotkeyService.addEventListener('RESOURCE_INFO', () => {
      this.statusBarService.showMessage('Информация о ресурсе');
    });

    // Системные операции
    hotkeyService.addEventListener('EXIT', () => {
      this.statusBarService.showMessage('Выход из приложения');
    });
  }

  /**
   * Добавление слушателя для кастомного действия
   */
  addCustomHotkeyListener(actionId: string, message: string, type: 'success' | 'message' | 'progress' | 'warning' = 'message'): void {
    hotkeyService.addEventListener(actionId, () => {
      switch (type) {
        case 'success':
          this.statusBarService.showSuccess(message);
          break;
        case 'progress':
          this.statusBarService.showProgress(message);
          break;
        case 'warning':
          this.statusBarService.showWarning(message);
          break;
        default:
          this.statusBarService.showMessage(message);
      }
      logger.dialog('Custom hotkey triggered', { actionId, message }, 'HotkeyStatusBarBridge');
    });
  }

  /**
   * Получение текущего состояния
   */
  getStatus(): { initialized: boolean; hotkeysEnabled: boolean } {
    return {
      initialized: this.isInitialized,
      hotkeysEnabled: hotkeyService.getState().isEnabled
    };
  }

  /**
   * Деактивация моста
   */
  deactivate(): void {
    this.isInitialized = false;
    logger.dialog('Hotkey-StatusBar bridge deactivated', {}, 'HotkeyStatusBarBridge');
  }
}

export const hotkeyStatusBarBridge = HotkeyStatusBarBridge.getInstance();
