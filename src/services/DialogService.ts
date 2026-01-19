import { 
  DialogResult, 
  DialogEvent, 
  DialogEventHandler,
  DialogStatus,
  DialogCategory
} from '@/types/dialog/DialogTypes';

/**
 * Интерфейс для регистрации диалога
 */
export interface DialogRegistration {
  id: string;
  category: DialogCategory;
  component: React.ComponentType<any>;
  config?: {
    width?: number;
    height?: number;
    modal?: boolean;
  };
}

/**
 * Интерфейс для состояния диалога
 */
export interface DialogState {
  id: string;
  isOpen: boolean;
  data?: any;
  status: DialogStatus;
  config?: any;
}

/**
 * Сервис для управления всеми диалоговыми окнами приложения
 * Реизует SOLID принцип Single Responsibility
 * Следует Clean Architecture (Application Layer)
 */
export class DialogService {
  private static instance: DialogService;
  private dialogs: Map<string, DialogRegistration> = new Map();
  private activeDialogs: Map<string, DialogState> = new Map();
  private eventHandlers: Map<string, DialogEventHandler[]> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Получение singleton экземпляра
   */
  public static getInstance(): DialogService {
    if (!DialogService.instance) {
      DialogService.instance = new DialogService();
    }
    return DialogService.instance;
  }

  /**
   * Регистрация нового типа диалога
   */
  public registerDialog(registration: DialogRegistration): void {
    if (this.dialogs.has(registration.id)) {
      console.warn(`Dialog with id ${registration.id} already registered`);
      return;
    }

    this.dialogs.set(registration.id, registration);
    this.emitEvent({
      type: 'open',
      dialogId: registration.id,
      timestamp: new Date()
    });
  }

  /**
   * Открытие диалога
   */
  public openDialog(dialogId: string, data?: any, config?: any): Promise<DialogResult> {
    return new Promise((resolve) => {
      const registration = this.dialogs.get(dialogId);
      if (!registration) {
        console.error(`Dialog with id ${dialogId} not found`);
        resolve({
          success: false,
          error: 'Dialog not found',
          action: 'cancel'
        });
        return;
      }

      // Закрытие существующего диалога того же типа
      if (this.activeDialogs.has(dialogId)) {
        this.closeDialog(dialogId);
      }

      const dialogState: DialogState = {
        id: dialogId,
        isOpen: true,
        data,
        status: DialogStatus.INITIAL,
        config: { ...registration.config, ...config }
      };

      this.activeDialogs.set(dialogId, dialogState);
      
      // Сохранение resolver для последующего вызова при закрытии
      (dialogState as any).resolver = resolve;

      this.emitEvent({
        type: 'open',
        dialogId,
        timestamp: new Date(),
        data
      });

      this.notifyListeners();
    });
  }

  /**
   * Закрытие диалога
   */
  public closeDialog(dialogId: string, result?: DialogResult): void {
    const dialogState = this.activeDialogs.get(dialogId);
    if (!dialogState) {
      return;
    }

    // Вызов resolver если есть
    if ((dialogState as any).resolver && result) {
      (dialogState as any).resolver(result);
    }

    this.activeDialogs.delete(dialogId);
    
    this.emitEvent({
      type: 'close',
      dialogId,
      timestamp: new Date(),
      data: result
    });

    this.notifyListeners();
  }

  /**
   * Получение зарегистрированного диалога по ID
   */
  public getDialog(dialogId: string): DialogRegistration | null {
    return this.dialogs.get(dialogId) || null;
  }

  /**
   * Получение состояния диалога
   */
  public getDialogState(dialogId: string): DialogState | undefined {
    return this.activeDialogs.get(dialogId);
  }

  /**
   * Получение всех активных диалогов
   */
  public getActiveDialogs(): DialogState[] {
    return Array.from(this.activeDialogs.values());
  }

  /**
   * Проверка открыт ли диалог
   */
  public isDialogOpen(dialogId: string): boolean {
    const state = this.activeDialogs.get(dialogId);
    return state?.isOpen || false;
  }

  /**
   * Обновление данных диалога
   */
  public updateDialogData(dialogId: string, data: any): void {
    const dialogState = this.activeDialogs.get(dialogId);
    if (dialogState) {
      dialogState.data = data;
      this.notifyListeners();
    }
  }

  /**
   * Обновление статуса диалога
   */
  public updateDialogStatus(dialogId: string, status: DialogStatus): void {
    const dialogState = this.activeDialogs.get(dialogId);
    if (dialogState) {
      dialogState.status = status;
      this.notifyListeners();
    }
  }

  /**
   * Закрытие всех диалогов
   */
  public closeAllDialogs(): void {
    const dialogIds = Array.from(this.activeDialogs.keys());
    dialogIds.forEach(id => this.closeDialog(id));
  }

  /**
   * Получение всех зарегистрированных диалогов по категории
   */
  public getDialogsByCategory(category: DialogCategory): DialogRegistration[] {
    return Array.from(this.dialogs.values())
      .filter(dialog => dialog.category === category);
  }

  /**
   * Подписка на события диалога
   */
  public addEventListener(eventType: string, handler: DialogEventHandler): void {
    const key = `${eventType}_handlers`;
    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, []);
    }
    
    const handlers = this.eventHandlers.get(key)!;
    handlers.push(handler);
  }

  /**
   * Отписка от событий диалога
   */
  public removeEventListener(eventType: string, handler: DialogEventHandler): void {
    const key = `${eventType}_handlers`;
    const handlers = this.eventHandlers.get(key);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Подписка на изменения состояния
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Излучение события
   */
  private emitEvent(event: DialogEvent): void {
    const key = `${event.type}_handlers`;
    const handlers = this.eventHandlers.get(key);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Dialog event handler error:', error);
        }
      });
    }
  }

  /**
   * Уведомление всех слушателей
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Dialog listener error:', error);
      }
    });
  }

  /**
   * Очистка ресурсов
   */
  public dispose(): void {
    this.dialogs.clear();
    this.activeDialogs.clear();
    this.eventHandlers.clear();
    this.listeners.clear();
  }
}

// Экспорт singleton экземпляра для совместимости
export const dialogService = DialogService.getInstance();

// Экспорт singleton по умолчанию для удобного импорта
export default DialogService.getInstance();

