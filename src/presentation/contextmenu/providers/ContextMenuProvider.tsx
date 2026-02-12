import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { IContextMenu, IContextMenuItem } from '../../../domain/contextmenu/entities/ContextMenu'
import { IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu'
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType'
import { ContextMenuComponent } from '../components/ContextMenu'
import { ContextMenuService } from '@/application/contextmenu/services/ContextMenuService'
import { ResourceContextMenuFactory } from '@/infrastructure/contextmenu/factories/ResourceContextMenuFactory'
import { TaskContextMenuFactory } from '@/infrastructure/contextmenu/factories/TaskContextMenuFactory'
import { logger } from '@/utils/logger'
import type { Throwable } from '@/utils/errorUtils'
import { toCaughtError, getCaughtErrorMessage } from '@/errors/CaughtError'
import { generateMenuId } from '@/utils/id-utils'

/**
 * Контекст для управления контекстными меню
 */
interface IContextMenuReactContext {
  currentMenu: IContextMenu | null;
  isMenuVisible: boolean;
  showMenu: (type: ContextMenuType, context: IContextMenuContext) => Promise<void>;
  hideMenu: () => void;
  executeAction: (actionId: string) => Promise<void>;
}

const ContextMenuReactContext = createContext<IContextMenuReactContext | null>(null)

/**
 * Хук для использования контекстного меню
 */
export const useContextMenu = (): IContextMenuReactContext => {
  const context = useContext(ContextMenuReactContext)
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider')
  }
  return context
}

/**
 * Provider для контекстных меню с интеграцией ContextMenuService
 */
export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMenu, setCurrentMenu] = useState<IContextMenu | null>(null)
  const [isMenuVisible, setIsMenuVisible] = useState(false)

  // Инициализация сервиса и регистрация фабрик
  const contextMenuService = useMemo(() => {
    const service = new ContextMenuService()

    // Регистрируем фабрики для разных типов меню
    service.registerFactory(ContextMenuType.RESOURCE, new ResourceContextMenuFactory())
    service.registerFactory(ContextMenuType.TASK, new TaskContextMenuFactory())

    logger.info('[ContextMenuProvider] Service initialized with factories:', service.getRegisteredTypes())

    return service
  }, [])

  const showMenu = useCallback(async (type: ContextMenuType, context: IContextMenuContext) => {
    logger.info(`[ContextMenuProvider] showMenu type=${type}`)

    let menu: IContextMenu | null = null

    try {
      // ПРИОРИТЕТ 1: Если переданы actions — использовать их напрямую
      // Это важно для Gantt, WBS и других компонентов со своим меню
      if (context.actions && context.actions.length > 0) {
        logger.info(`[ContextMenuProvider] Using ${context.actions.length} provided actions`)

        const items: IContextMenuItem[] = context.actions.map((action, idx) => {
          if (action.divider) {
            return {
              id: `divider-${idx}`,
              label: '',
              separator: true,
            } as IContextMenuItem
          }

          return {
            id: `action-${idx}`,
            label: action.label || '',
            icon: action.icon,
            disabled: action.disabled,
            tooltip: action.tooltip,
            action: {
              execute: async () => action.onClick ? action.onClick() : Promise.resolve(),
              canExecute: () => !action.disabled,
              getLabel: () => action.label || '',
              getIcon: () => action.icon,
              getShortcut: () => '',
            },
          } as IContextMenuItem
        })

        menu = {
          id: generateMenuId(),
          type,
          items,
          position: context.position,
          status: ContextMenuStatus.VISIBLE,
          target: context.target,
        }
      } else {
        // ПРИОРИТЕТ 2: Использовать фабрику (для ResourceSheet, TaskUsage и т.д.)
        try {
          menu = await contextMenuService.showMenu(type, context)
          if (menu) {
            logger.info(`[ContextMenuProvider] Factory menu created with ${menu.items.length} items`)
          }
        } catch (factoryError) {
          const errMsg = factoryError instanceof Error ? factoryError.message : String(factoryError)
          logger.warning(`[ContextMenuProvider] Factory failed: ${errMsg}`)
          // Не показываем меню если фабрика не сработала и нет actions
          return
        }
      }

      if (menu) {
        setCurrentMenu(menu)
        setIsMenuVisible(true)
      }

    } catch (criticalError) {
      const caughtError = toCaughtError(criticalError as Throwable)
      const errMsg = getCaughtErrorMessage(caughtError)
      logger.error(`[ContextMenuProvider] CRITICAL ERROR: ${errMsg}`)
    }
  }, [contextMenuService])

  const hideMenu = useCallback(() => {
    setIsMenuVisible(false)
    setTimeout(() => {
      setCurrentMenu(null)
    }, 200) // Дать время на анимацию закрытия
  }, [])

  const executeAction = useCallback(async (actionId: string) => {
    if (!currentMenu) {
      throw new Error('No active menu')
    }

    try {
      const menuItem = currentMenu.items.find((item: IContextMenuItem) => item.id === actionId)
      if (menuItem?.action) {
        await menuItem.action.execute()
      }
    } catch (error) {
      const caughtError = toCaughtError(error as Throwable)
      const errorMessage = getCaughtErrorMessage(caughtError)
      logger.error(`Failed to execute menu action: ${errorMessage}`)
    }
  }, [currentMenu])

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (isMenuVisible) {
        // Проверяем что клик был вне контекстного меню
        const target = event.target as Element
        if (!target.closest('.context-menu')) {
          hideMenu()
        }
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuVisible) {
        hideMenu()
      }
    }

    document.addEventListener('click', handleGlobalClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleGlobalClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuVisible, hideMenu])

  const value: IContextMenuReactContext = {
    currentMenu,
    isMenuVisible,
    showMenu,
    hideMenu,
    executeAction,
  }

  return (
    <ContextMenuReactContext.Provider value={value}>
      {children}

      {currentMenu && isMenuVisible && (
        <ContextMenuComponent
          menu={currentMenu}
          onHide={hideMenu}
          onActionExecute={executeAction}
        />
      )}
    </ContextMenuReactContext.Provider>
  )
}

