import { IContextMenu, IContextMenuContext } from '../entities/ContextMenu'
import { ContextMenuType } from '../ContextMenuType'

/**
 * Сервис для управления контекстными меню
 * Интерфейс для Application Layer
 */
export interface IContextMenuService {
  /**
   * Показать контекстное меню
   */
  showMenu(type: ContextMenuType, context: IContextMenuContext): Promise<IContextMenu>;

  /**
   * Скрыть контекстное меню
   */
  hideMenu(menuId: string): Promise<void>;

  /**
   * Получить текущее активное меню
   */
  getActiveMenu(): IContextMenu | null;

  /**
   * Выполнить действие пункта меню
   */
  executeAction(menuId: string, actionId: string): Promise<void>;

  /**
   * Зарегистрировать фабрику меню для типа
   */
  registerFactory(type: ContextMenuType, factory: IMenuFactory): void;

  /**
   * Получить все зарегистрированные типы меню
   */
  getRegisteredTypes(): ContextMenuType[];
}

/**
 * Фабрика для создания контекстных меню
 */
export interface IMenuFactory {
  /**
   * Создать контекстное меню
   */
  createMenu(context: IContextMenuContext): Promise<IContextMenu>;

  /**
   * Проверить может ли фабрика создать меню для контекста
   */
  canHandle(context: IContextMenuContext): boolean;
}

