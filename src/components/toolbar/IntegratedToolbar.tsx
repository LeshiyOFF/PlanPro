import React, { useCallback, useMemo, useRef } from 'react';
import { useActionManager } from '@/providers/hooks/useActionManager';
import './ToolbarStyles.css';
import './IntegratedToolbarStyles.css';
import {
  NewAction,
  OpenAction,
  SaveAction,
  SaveAsAction
} from '../toolbar/actions';
import { 
  FilePlus,
  FolderOpen,
  Save,
  FileText
} from 'lucide-react';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useProjectStore } from '@/store/projectStore';

/**
 * Интерфейс интегрированного тулбара (Hotbar)
 */
interface IIntegratedToolbarProps {
  className?: string;
  onAction?: (actionId: string, actionLabel: string) => void;
}

/**
 * Компактный Hotbar для работы с файлами.
 * Отображает текущий статус проекта и основные операции.
 */
export const IntegratedToolbar: React.FC<IIntegratedToolbarProps> = ({ 
  className, 
  onAction 
}) => {
  const { currentFilePath, isDirty } = useProjectStore();
  const { createNewProject, openProject, saveProject, saveProjectAs } = useFileOperations();

  // Извлечение имени файла из полного пути
  const projectName = useMemo(() => {
    if (!currentFilePath) return 'Новый проект';
    // Находим последний слэш или бэк-слэш
    const lastSlash = Math.max(currentFilePath.lastIndexOf('/'), currentFilePath.lastIndexOf('\\'));
    return lastSlash === -1 ? currentFilePath : currentFilePath.substring(lastSlash + 1);
  }, [currentFilePath]);

  // Создаём действия
  const actions = useMemo(() => ({
    new: new NewAction(createNewProject),
    open: new OpenAction(openProject),
    save: new SaveAction(saveProject),
    saveAs: new SaveAsAction(saveProjectAs)
  }), [createNewProject, openProject, saveProject, saveProjectAs]);

  const lastClickTimeRef = useRef<Map<string, number>>(new Map());
  const DEBOUNCE_MS = 300;

  const handleAction = useCallback((actionId: string, actionLabel: string) => {
    const now = Date.now();
    const lastClick = lastClickTimeRef.current.get(actionId) || 0;
    
    if (now - lastClick < DEBOUNCE_MS) return;
    lastClickTimeRef.current.set(actionId, now);
    
    try {
      onAction?.(actionId, actionLabel);
    } catch (error) {
      console.error(`Ошибка при выполнении действия ${actionId}:`, error);
    }
  }, [onAction]);

  // Вспомогательный компонент кнопки
  const ToolbarButton = ({ action, id, icon: Icon, tooltip }: any) => (
    <button
      className="toolbar-button"
      onClick={() => handleAction(id, action.label)}
      title={tooltip || action.label}
    >
      <span className="toolbar-button-icon">
        <Icon />
      </span>
    </button>
  );

  return (
    <div className={`integrated-toolbar-container ${className || ''}`}>
      {/* ЛЕВАЯ ЧАСТЬ: Информация о проекте */}
      <div className="toolbar-project-info">
        <FileText className="project-icon h-4 w-4" />
        <span className="project-name" title={currentFilePath || 'Проект не сохранен'}>
          {projectName}
        </span>
        <span className={`project-status ${isDirty ? 'dirty' : ''}`}>
          {isDirty ? 'Изменено •' : 'Сохранено'}
        </span>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Файловые операции */}
      <div className="toolbar-actions-group">
        <ToolbarButton 
          id="TB001" 
          action={actions.new} 
          icon={FilePlus} 
          tooltip="Создать новый проект (Ctrl+N)" 
        />
        <ToolbarButton 
          id="TB002" 
          action={actions.open} 
          icon={FolderOpen} 
          tooltip="Открыть существующий проект (Ctrl+O)" 
        />
        
        <div className="toolbar-divider" />
        
        <ToolbarButton 
          id="TB003" 
          action={actions.save} 
          icon={Save} 
          tooltip="Сохранить текущий проект (Ctrl+S)" 
        />
        <ToolbarButton 
          id="TB003_AS" 
          action={actions.saveAs} 
          icon={() => (
            <div className="relative">
              <Save />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-bold leading-none bg-background px-0.5 rounded shadow-sm">+</span>
            </div>
          )} 
          tooltip="Сохранить как... (Ctrl+Shift+S)" 
        />
      </div>
    </div>
  );
};

export default IntegratedToolbar;

