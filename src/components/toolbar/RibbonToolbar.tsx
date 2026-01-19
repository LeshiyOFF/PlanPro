import React, { useMemo } from 'react';
import { useActionsByCategory } from '@/providers/ActionProvider';
import { ActionCategory } from '@/services/actions/ActionManager';

/**
 * Хук для получения ID действий для категории
 */
const useActionIds = (actions: any[], requiredIds: string[]) => {
  return useMemo(() => {
    return requiredIds.filter(id => 
      actions.some(action => action.id === id)
    );
  }, [actions, requiredIds]);
};

/**
 * Конфигурация Ribbon toolbar
 */
interface RibbonToolbarProps {
  onActionStatesUpdate?: () => void;
}

/**
 * Ribbon toolbar компонент
 */
export const RibbonToolbar: React.FC<RibbonToolbarProps> = ({ 
  onActionStatesUpdate 
}) => {
  // Получение действий по категориям
  const fileActions = useActionsByCategory(ActionCategory.FILE);
  const editActions = useActionsByCategory(ActionCategory.EDIT);
  const viewActions = useActionsByCategory(ActionCategory.VIEW);
  const insertActions = useActionsByCategory(ActionCategory.INSERT);
  const toolsActions = useActionsByCategory(ActionCategory.TOOLS);

  // ID действий для каждой категории
  const fileActionIds = useActionIds(fileActions, ['new-project', 'open-project', 'save-project', 'save-project-as', 'print']);
  const editActionIds = useActionIds(editActions, ['undo', 'redo', 'cut', 'copy', 'paste']);
  const viewActionIds = useActionIds(viewActions, []);
  const insertActionIds = useActionIds(insertActions, ['new-task', 'new-resource']);
  const toolsActionIds = useActionIds(toolsActions, ['search']);

  return (
    <header className="ribbon-toolbar border-b border-border bg-card">
      <div className="flex items-center h-14 px-2 gap-2">
        {/* Файловые действия */}
        {fileActionIds.length > 0 && (
          <div className="toolbar-group flex items-center gap-1">
            {fileActionIds.map(actionId => {
              const { ToolbarButton } = require('./ToolbarButton');
              return <ToolbarButton key={actionId} actionId={actionId} />;
            })}
            <div className="mx-1 h-6 w-px bg-border"></div>
          </div>
        )}

        {/* Действия редактирования */}
        {editActionIds.length > 0 && (
          <div className="toolbar-group flex items-center gap-1">
            {editActionIds.map(actionId => {
              const { ToolbarButton } = require('./ToolbarButton');
              return <ToolbarButton key={actionId} actionId={actionId} />;
            })}
            <div className="mx-1 h-6 w-px bg-border"></div>
          </div>
        )}

        {/* Инструменты */}
        {toolsActionIds.length > 0 && (
          <div className="toolbar-group flex items-center gap-1">
            {toolsActionIds.map(actionId => {
              const { ToolbarButton } = require('./ToolbarButton');
              return <ToolbarButton key={actionId} actionId={actionId} />;
            })}
            <div className="mx-1 h-6 w-px bg-border"></div>
          </div>
        )}
      </div>
    </header>
  );
};

export default RibbonToolbar;
