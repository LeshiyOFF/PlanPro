import React, { useEffect, useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';

/**
 * Компонент-guard для предотвращения случайного выхода при несохраненных изменениях.
 * Показывает системный диалог подтверждения при попытке закрыть приложение.
 * 
 * Использует Electron API для перехвата события закрытия окна.
 */
export const UnsavedChangesGuard: React.FC = () => {
  const isDirty = useProjectStore((state) => state.isDirty);
  
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (isDirty) {
      // Стандартный способ показать диалог подтверждения в браузере
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  }, [isDirty]);
  
  const handleElectronClose = useCallback(async () => {
    if (!isDirty) return true;
    
    if (!window.electronAPI) return true;
    
    try {
      const result = await window.electronAPI.showMessageBox({
        type: 'warning',
        title: 'Несохраненные изменения',
        message: 'В проекте есть несохраненные изменения. Вы уверены, что хотите выйти?',
        buttons: ['Выйти без сохранения', 'Отмена'],
        defaultId: 1,
        cancelId: 1
      });
      
      // Если пользователь выбрал "Выйти без сохранения" (index 0)
      return result.response === 0;
    } catch (error) {
      console.error('[UnsavedChangesGuard] Error showing dialog:', error);
      return true;
    }
  }, [isDirty]);
  
  useEffect(() => {
    // Добавляем слушатель для веб-версии
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Регистрируем обработчик для Electron
    if (window.electronAPI?.onCloseRequested) {
      window.electronAPI.onCloseRequested(handleElectronClose);
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload, handleElectronClose]);
  
  // Компонент невидим
  return null;
};

