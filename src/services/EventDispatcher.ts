/**
 * Event Dispatcher - центральная система обработки событий
 * Следует SOLID принципам и паттерну Singleton
 */

import { 
  BaseEvent, 
  EventHandler, 
  EventSubscription, 
  EventType, 
  IEventDispatcher 
} from '@/types/EventFlowTypes';

/**
 * Синглтон диспетчер событий
 * Реализует централизованную обработку всех UI событий
 */
export class EventDispatcher implements IEventDispatcher {
  private static instance: EventDispatcher;
  private subscriptions: Map<EventType, EventSubscription[]> = new Map();
  private middleware: Array<(event: BaseEvent) => BaseEvent> = [];
  private isProcessing = false;
  private eventQueue: BaseEvent[] = [];

  private constructor() {
    this.setupGlobalErrorHandler();
  }

  /**
   * Получение единственного экземпляра
   */
  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  /**
   * Диспетчеризация события
   */
  public dispatch(event: BaseEvent): void {
    // Применяем middleware
    let processedEvent = event;
    for (const middleware of this.middleware) {
      try {
        processedEvent = middleware(processedEvent);
      } catch (error) {
        console.error('Middleware error:', error);
        return;
      }
    }

    // Добавляем в очередь для асинхронной обработки
    this.eventQueue.push(processedEvent);
    
    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }

  /**
   * Подписка на событие
   */
  public subscribe(
    eventType: EventType, 
    handler: EventHandler, 
    priority: number = 0
  ): string {
    const subscriptionId = this.generateId();
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      priority,
      once: false
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscriptions = this.subscriptions.get(eventType)!;
    subscriptions.push(subscription);
    
    // Сортируем по приоритету (высший приоритет = раньше выполняется)
    subscriptions.sort((a, b) => b.priority - a.priority);

    return subscriptionId;
  }

  /**
   * Подписка на одно выполнение события
   */
  public once(eventType: EventType, handler: EventHandler): string {
    const subscriptionId = this.generateId();
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      priority: 0,
      once: true
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);
    return subscriptionId;
  }

  /**
   * Отписка от события
   */
  public unsubscribe(subscriptionId: string): void {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        break;
      }
    }
  }

  /**
   * Очистка всех подписок
   */
  public clear(): void {
    this.subscriptions.clear();
    this.eventQueue = [];
  }

  /**
   * Добавление middleware для обработки событий
   */
  public addMiddleware(middleware: (event: BaseEvent) => BaseEvent): void {
    this.middleware.push(middleware);
  }

  /**
   * Удаление middleware
   */
  public removeMiddleware(middleware: (event: BaseEvent) => BaseEvent): void {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }

  /**
   * Получение количества подписчиков для события
   */
  public getSubscriptionCount(eventType: EventType): number {
    return this.subscriptions.get(eventType)?.length || 0;
  }

  /**
   * Обработка очереди событий
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.processEvent(event);
    }
    
    this.isProcessing = false;
  }

  /**
   * Обработка отдельного события
   */
  private async processEvent(event: BaseEvent): Promise<void> {
    const subscriptions = this.subscriptions.get(event.type);
    if (!subscriptions) return;

    const subscriptionsToRemove: string[] = [];

    for (const subscription of subscriptions) {
      try {
        await Promise.resolve(subscription.handler(event));
        
        if (subscription.once) {
          subscriptionsToRemove.push(subscription.id);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
        // Продолжаем обработку других подписчиков
      }
    }

    // Удаляем one-time подписки
    for (const subscriptionId of subscriptionsToRemove) {
      this.unsubscribe(subscriptionId);
    }
  }

  /**
   * Генерация уникального ID
   */
  private generateId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Настройка глобального обработчика ошибок
   */
  private setupGlobalErrorHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.dispatch({
          id: this.generateId(),
          type: EventType.NOTIFICATION_ERROR,
          timestamp: new Date(),
          source: 'EventDispatcher',
          data: {
            title: 'JavaScript Error',
            message: event.message || 'Unknown error occurred'
          }
        });
      });
    }
  }
}

// Экспорт синглтона
export const eventDispatcher = EventDispatcher.getInstance();

