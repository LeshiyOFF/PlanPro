import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Тип контекстного меню
 */
export type ContextMenuType = 
  | 'task' 
  | 'resource' 
  | 'project' 
  | 'gantt'
  | 'timesheet'
  | 'calendar'
  | 'report'
  | 'options';

/**
 * Пункт контекстного меню
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  handler: () => void;
}

/**
 * Конфигурация контекстного меню
 */
export interface ContextMenuConfig {
  type: ContextMenuType;
  items: ContextMenuItem[];
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Контекст для меню
 */
export const MenuContext = createContext<MenuContextType | null>(null);

/**
 * Тип контекста меню
 */
export interface MenuContextType {
  contextMenu: ContextMenuConfig | null;
  showContextMenu: (
    type: ContextMenuType,
    items: ContextMenuItem[],
    x: number,
    y: number
  ) => void;
  hideContextMenu: () => void;
}

/**
 * Хук для использования контекста меню
 */
export const useMenuContext = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};

/**
 * Провайдер для управления меню
 */
export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuConfig | null>(null);

  const showContextMenu = useCallback((
    type: ContextMenuType,
    items: ContextMenuItem[],
    x: number,
    y: number
  ) => {
    setContextMenu({
      type,
      items: items.filter(item => !item.separator || item.id !== 'separator'),
      x,
      y,
      visible: true
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu?.visible) {
        hideContextMenu();
      }
    };

    if (contextMenu?.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu?.visible, hideContextMenu]);

  const contextValue: MenuContextType = {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
};
