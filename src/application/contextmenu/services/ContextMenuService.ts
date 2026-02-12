import { IContextMenu, IContextMenuContext } from '@/domain/contextmenu/entities/ContextMenu'
import { ContextMenuType, ContextMenuStatus } from '@/domain/contextmenu/ContextMenuType'
import {
  IContextMenuService,
  IMenuFactory,
} from '@/domain/contextmenu/services/IContextMenuService'
import { ShowContextMenuUseCase } from '@/application/contextmenu/usecases/ShowContextMenuUseCase'
import { ExecuteMenuActionUseCase } from '@/application/contextmenu/usecases/ExecuteMenuActionUseCase'
import { logger } from '@/utils/logger'
import { getErrorMessage } from '@/utils/errorUtils'
import { generateMenuId } from '@/utils/id-utils'

/**
 * Сервис контекстных меню
 * Реализация IContextMenuService для Application Layer
 */
export class ContextMenuService implements IContextMenuService {
  private activeMenu: IContextMenu | null = null
  private factories: Map<ContextMenuType, IMenuFactory> = new Map()

  private readonly showMenuUseCase: ShowContextMenuUseCase
  private readonly executeActionUseCase: ExecuteMenuActionUseCase

  constructor() {
    this.showMenuUseCase = new ShowContextMenuUseCase(this.factories)
    this.executeActionUseCase = new ExecuteMenuActionUseCase()
  }

  /**
   * Показать контекстное меню
   */
  async showMenu(type: ContextMenuType, context: IContextMenuContext): Promise<IContextMenu> {
    try {
      logger.info(`Showing context menu of type: ${type}`)

      // Закрыть предыдущее меню если есть
      if (this.activeMenu) {
        await this.hideMenu(this.activeMenu.id)
      }

      // Создать новое меню через Use Case
      const menu = await this.showMenuUseCase.execute(type, context)

      // Установить статус видимый
      const activeMenu: IContextMenu = {
        ...menu,
        status: ContextMenuStatus.VISIBLE,
      }
      this.activeMenu = activeMenu

      logger.info(`Context menu created with ID: ${activeMenu.id}`)
      return activeMenu

    } catch (error) {
      logger.error(`Failed to show context menu: ${getErrorMessage(error)}`)
      throw error
    }
  }

  /**
   * Скрыть контекстное меню
   */
  async hideMenu(menuId: string): Promise<void> {
    try {
      if (this.activeMenu && this.activeMenu.id === menuId) {
        logger.info(`Hiding context menu: ${menuId}`)
        this.activeMenu = null
      }
    } catch (error) {
      logger.error(`Failed to hide context menu: ${getErrorMessage(error)}`)
      throw error
    }
  }

  /**
   * Получить текущее активное меню
   */
  getActiveMenu(): IContextMenu | null {
    return this.activeMenu
  }

  /**
   * Выполнить действие пункта меню
   */
  async executeAction(menuId: string, actionId: string): Promise<void> {
    try {
      if (!this.activeMenu || this.activeMenu.id !== menuId) {
        throw new Error(`No active menu found with ID: ${menuId}`)
      }

      await this.executeActionUseCase.execute(this.activeMenu, actionId)
      logger.info(`Executed menu action: ${actionId}`)

    } catch (error) {
      logger.error(`Failed to execute menu action: ${getErrorMessage(error)}`)
      throw error
    }
  }

  /**
   * Зарегистрировать фабрику меню для типа
   */
  registerFactory(type: ContextMenuType, factory: IMenuFactory): void {
    if (!factory) {
      throw new Error('Factory cannot be null')
    }

    this.factories.set(type, factory)
    logger.info(`Registered context menu factory for type: ${type}`)
  }

  /**
   * Получить все зарегистрированные типы меню
   */
  getRegisteredTypes(): ContextMenuType[] {
    return Array.from(this.factories.keys())
  }

  /**
   * Сгенерировать уникальный ID для меню
   */
  generateMenuId(): string {
    return generateMenuId()
  }
}

