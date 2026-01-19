import React, { useState, useCallback } from 'react';
import { ContextMenu } from './ContextMenu';
import { useMenuContext } from '@/providers/MenuProvider';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { ContextMenuFactory } from './factories/ContextMenuFactory';
import { useFileOperations } from '@/hooks/useFileOperations';

import { useTaskDeletion } from '@/hooks/task/useTaskDeletion';

/**
 * Интегрированный Menu компонент
 * Объединяет Ribbon Menu, горячие клавиши и контекстные меню
 */
export const IntegratedMenu: React.FC = () => {
  const { contextMenu, showContextMenu, hideContextMenu } = useMenuContext();
  const { deleteTask, isDeletionAllowed } = useTaskDeletion();
  const { createNewProject, openProject, saveProject, saveProjectAs, loadProjectFromPath } = useFileOperations();
  const [activeTab, setActiveTab] = useState('file');

  // Обработчики горячих клавиш
  const handleShortcutAction = useCallback((action: string) => {
    console.log(`Hotkey triggered: ${action}`);
    
    switch (action) {
      case 'DELETE_TASK':
        if (!isDeletionAllowed) {
          console.warn('[IntegratedMenu] Deletion is disabled in preferences');
          break;
        }
        console.log('Task deletion triggered from menu/shortcut');
        break;
      case 'NEW_PROJECT':
        createNewProject();
        break;
      case 'OPEN_PROJECT':
        openProject();
        break;
      case 'SAVE_PROJECT':
        saveProject();
        break;
      case 'SAVE_AS':
        saveProjectAs();
        break;
      case 'INSERT_TASK':
        // TODO: Implement insert task action
        break;
      case 'FIND_TASK':
        // TODO: Implement find task action
        break;
      default:
        console.log(`Unhandled hotkey action: ${action}`);
    }
  }, [isDeletionAllowed, createNewProject, openProject, saveProject, saveProjectAs]);

  // Глобальный обработчик Drag-and-Drop
  React.useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        
        // Electron автоматически добавляет свойство 'path' к File объектам в drag-and-drop
        const filePath = (file as any).path;
        
        console.log('[IntegratedMenu] File dropped:', {
          name: file.name,
          type: file.type,
          size: file.size,
          path: filePath
        });
        
        if (filePath) {
          // Проверяем расширение файла
          if (!filePath.endsWith('.pod')) {
            if (window.electronAPI) {
              await window.electronAPI.showMessageBox({
                type: 'warning',
                title: 'Неверный формат файла',
                message: 'Можно открывать только файлы с расширением .pod'
              });
            }
            return;
          }
          
          console.log(`[IntegratedMenu] Loading project from: ${filePath}`);
          await loadProjectFromPath(filePath);
        } else {
          // Fallback: если path недоступен, предлагаем использовать диалог
          console.error('[IntegratedMenu] File path not available from drop event. This might be a security restriction.');
          
          if (window.electronAPI) {
            await window.electronAPI.showMessageBox({
              type: 'info',
              title: 'Используйте кнопку "Открыть"',
              message: 'Drag-and-drop временно недоступен из-за настроек безопасности.\n\nИспользуйте кнопку "Открыть" в меню для выбора файла проекта.'
            });
          }
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [loadProjectFromPath]);

  // Конфигурация горячих клавиш
  const shortcuts = [
    { key: DEFAULT_SHORTCUTS.NEW_PROJECT, description: 'Новый проект', handler: () => handleShortcutAction('NEW_PROJECT') },
    { key: DEFAULT_SHORTCUTS.OPEN_PROJECT, description: 'Открыть проект', handler: () => handleShortcutAction('OPEN_PROJECT') },
    { key: DEFAULT_SHORTCUTS.SAVE_PROJECT, description: 'Сохранить проект', handler: () => handleShortcutAction('SAVE_PROJECT') },
    { key: DEFAULT_SHORTCUTS.SAVE_AS, description: 'Сохранить как', handler: () => handleShortcutAction('SAVE_AS') },
    { key: DEFAULT_SHORTCUTS.PRINT, description: 'Печать', handler: () => handleShortcutAction('PRINT') },
    { key: DEFAULT_SHORTCUTS.INSERT_TASK, description: 'Вставить задачу', handler: () => handleShortcutAction('INSERT_TASK') },
    { key: DEFAULT_SHORTCUTS.DELETE_TASK, description: 'Удалить задачу', handler: () => handleShortcutAction('DELETE_TASK') },
    { key: DEFAULT_SHORTCUTS.INDENT_TASK, description: 'Увеличить отступ', handler: () => handleShortcutAction('INDENT_TASK') },
    { key: DEFAULT_SHORTCUTS.OUTDENT_TASK, description: 'Уменьшить отступ', handler: () => handleShortcutAction('OUTDENT_TASK') },
    { key: DEFAULT_SHORTCUTS.FIND_TASK, description: 'Найти задачу', handler: () => handleShortcutAction('FIND_TASK') },
    { key: DEFAULT_SHORTCUTS.GOTO_TASK, description: 'Перейти к задаче', handler: () => handleShortcutAction('GOTO_TASK') },
    { key: DEFAULT_SHORTCUTS.UNDO, description: 'Отменить', handler: () => handleShortcutAction('UNDO') },
    { key: DEFAULT_SHORTCUTS.REDO, description: 'Повторить', handler: () => handleShortcutAction('REDO') },
    { key: DEFAULT_SHORTCUTS.CUT, description: 'Вырезать', handler: () => handleShortcutAction('CUT') },
    { key: DEFAULT_SHORTCUTS.COPY, description: 'Копировать', handler: () => handleShortcutAction('COPY') },
    { key: DEFAULT_SHORTCUTS.PASTE, description: 'Вставить', handler: () => handleShortcutAction('PASTE') },
    { key: DEFAULT_SHORTCUTS.ZOOM_IN, description: 'Увеличить масштаб', handler: () => handleShortcutAction('ZOOM_IN') },
    { key: DEFAULT_SHORTCUTS.ZOOM_OUT, description: 'Уменьшить масштаб', handler: () => handleShortcutAction('ZOOM_OUT') },
    { key: DEFAULT_SHORTCUTS.FIT_TO_WIDTH, description: 'Масштаб по ширине', handler: () => handleShortcutAction('FIT_TO_WIDTH') },
    { key: DEFAULT_SHORTCUTS.TASK_INFO, description: 'Информация о задаче', handler: () => handleShortcutAction('TASK_INFO') },
    { key: DEFAULT_SHORTCUTS.ASSIGN_RESOURCES, description: 'Назначить ресурсы', handler: () => handleShortcutAction('ASSIGN_RESOURCES') },
    { key: DEFAULT_SHORTCUTS.RESOURCE_INFO, description: 'Информация о ресурсе', handler: () => handleShortcutAction('RESOURCE_INFO') },
    { key: DEFAULT_SHORTCUTS.EXIT, description: 'Выход', handler: () => handleShortcutAction('EXIT') }
  ];

  // Включаем горячие клавиши
  useKeyboardShortcuts(shortcuts, true);

  // Обработчики контекстных меню
  const handleContextMenuAction = useCallback((type: string, action: string) => {
    console.log(`Context menu action: ${type} - ${action}`);
    
    switch (type) {
      case 'task':
        // TODO: Implement task context actions
        break;
      case 'resource':
        // TODO: Implement resource context actions
        break;
      case 'project':
        // TODO: Implement project context actions
        break;
      case 'gantt':
        // TODO: Implement gantt context actions
        break;
      default:
        console.log(`Unhandled context menu action: ${type} - ${action}`);
    }
  }, []);

  // Обработчик правого клика мыши
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    const target = event.target as HTMLElement;
    const contextType = target.getAttribute('data-context-type') as string;
    
    let menuItems: any[] = [];
    
    switch (contextType) {
      case 'task':
        menuItems = ContextMenuFactory.createTaskContextMenu((action) => handleContextMenuAction('task', action));
        break;
      case 'resource':
        menuItems = ContextMenuFactory.createResourceContextMenu((action) => handleContextMenuAction('resource', action));
        break;
      case 'project':
        menuItems = ContextMenuFactory.createProjectContextMenu((action) => handleContextMenuAction('project', action));
        break;
      case 'gantt':
        menuItems = ContextMenuFactory.createGanttContextMenu((action) => handleContextMenuAction('gantt', action));
        break;
    }
    
    if (menuItems.length > 0) {
      showContextMenu(contextType as any, menuItems, event.clientX, event.clientY);
    }
  }, [showContextMenu, handleContextMenuAction]);

  return (
    <>
      {contextMenu && (
        <ContextMenu
          config={contextMenu}
          onHide={hideContextMenu}
        />
      )}
    </>
  );
};

export default IntegratedMenu;

