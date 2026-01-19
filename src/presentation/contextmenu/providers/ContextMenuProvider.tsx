import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IContextMenu, IContextMenuItem } from '../../../domain/contextmenu/entities/ContextMenu';
import { IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu';
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType';
import { ContextMenuComponent } from '../components/ContextMenu';
import { logger } from '@/utils/logger';

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

const ContextMenuReactContext = createContext<IContextMenuReactContext | null>(null);

/**
 * Хук для использования контекстного меню
 */
export const useContextMenu = (): IContextMenuReactContext => {
  const context = useContext(ContextMenuReactContext);
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider');
  }
  return context;
};

/**
 * Provider для контекстных меню
 */
export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [currentMenu, setCurrentMenu] = useState<IContextMenu | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const showMenu = useCallback(async (type: ContextMenuType, context: IContextMenuContext) => {
    try {
      logger.info(`Requesting context menu: ${type}`);
      
      let items: IContextMenuItem[] = [];

      if (context.actions && context.actions.length > 0) {
        items = context.actions.map((action, idx) => {
          if (action.divider) {
            return {
              id: `divider-${idx}`,
              label: '',
              separator: true
            } as IContextMenuItem;
          }

          return {
            id: `action-${idx}`,
            label: action.label || '',
            icon: action.icon,
            action: {
              execute: async () => action.onClick ? action.onClick() : Promise.resolve(),
              canExecute: () => true,
              getLabel: () => action.label || '',
              getIcon: () => action.icon,
              getShortcut: () => ''
            }
          } as IContextMenuItem;
        });
      } else {
        items = [
              {
            id: 'delete',
            label: t('context_menu.delete'),
            icon: '🗑️',
                action: {
              execute: async () => logger.info('Delete requested'),
                  canExecute: () => true,
              getLabel: () => t('context_menu.delete'),
              getIcon: () => '🗑️',
              getShortcut: () => 'Del'
                }
              }
        ];
          }

      const menu: IContextMenu = {
        id: `menu-${Date.now()}`,
        type,
        items,
        position: context.position,
        status: ContextMenuStatus.VISIBLE,
        target: context.target
      };

      setCurrentMenu(menu);
      setIsMenuVisible(true);

    } catch (error) {
      logger.error(`Failed to show context menu: ${error.message}`);
    }
  }, [t]);

  const hideMenu = useCallback(() => {
    setIsMenuVisible(false);
    setTimeout(() => {
      setCurrentMenu(null);
    }, 200); // Дать время на анимацию закрытия
  }, []);

  const executeAction = useCallback(async (actionId: string) => {
    if (!currentMenu) {
      throw new Error('No active menu');
    }

    try {
      // TODO: Интеграция с ContextMenuService.executeAction
      const menuItem = currentMenu.items.find(item => item.id === actionId);
      if (menuItem?.action) {
        await menuItem.action.execute();
      }
    } catch (error) {
      logger.error(`Failed to execute menu action: ${error.message}`);
    }
  }, [currentMenu]);

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (isMenuVisible) {
        // Проверяем что клик был вне контекстного меню
        const target = event.target as Element;
        if (!target.closest('.context-menu')) {
          hideMenu();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuVisible) {
        hideMenu();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuVisible, hideMenu]);

  const value: IContextMenuReactContext = {
    currentMenu,
    isMenuVisible,
    showMenu,
    hideMenu,
    executeAction
  };

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
  );
};
