import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { GanttCanvasController } from '@/components/gantt';
import { useProjectStore } from '@/store/projectStore';
import { TaskPropertiesDialog } from '@/components/dialogs/TaskPropertiesDialog';
import { LineChart, RefreshCw } from 'lucide-react';
import type { IGanttTaskUpdate } from '@/types/gantt/IGanttTypes';
import type { JsonObject } from '@/types/json-types';

/**
 * Tracking Gantt View - Гант отслеживания
 * 
 * Сравнение базового плана с текущим состоянием проекта.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const TrackingGanttView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const helpContent = useHelpContent();
  const { showMenu } = useContextMenu();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Глобальное хранилище задач
  const { tasks, updateTask } = useProjectStore();

  // Состояние диалога редактирования
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTaskSelect = useCallback((task: { id: string }) => {
    console.log('Tracking Gantt: Task selected:', task);
  }, []);

  const handleTaskDoubleClick = useCallback((task: { id: string }) => {
    setEditingTaskId(task.id);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingTaskId(null);
  }, []);

  const handleTaskUpdate = useCallback((taskId: string, updates: IGanttTaskUpdate) => {
    const partial: { startDate?: Date; endDate?: Date; progress?: number } = {};
    if (updates.startDate != null) partial.startDate = updates.startDate;
    if (updates.endDate != null) partial.endDate = updates.endDate;
    if (updates.progress != null) partial.progress = updates.progress;
    updateTask(taskId, partial);
  }, [updateTask]);

  const handleTaskContextMenu = useCallback((event: React.MouseEvent, taskData: JsonObject) => {
    event.preventDefault();
    showMenu(ContextMenuType.TASK, {
      target: { ...taskData, type: 'task' } as JsonObject,
      position: { x: event.clientX, y: event.clientY }
    });
  }, [showMenu]);

  return (
    <>
      <div className="h-full flex flex-col bg-slate-50">
        {/* Two-Tier Header: Заголовок + Панель действий */}
        <TwoTierHeader
          title={t('tracking_gantt.title')}
          description={t('descriptions.tracking')}
          icon={<LineChart className="w-6 h-6" />}
          help={helpContent.TRACKING}
          actionBar={{
            primaryAction: {
              label: t('view_controls.update_progress'),
              onClick: () => { /* Update progress: reserved for future implementation */ },
              icon: <RefreshCw className="w-4 h-4" />
            }
          }}
        />

        {/* Основной контент */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="flex h-full gap-4">
            {/* Панель задач */}
            <div className="w-64 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
              <div className="px-4 py-3 border-b border-border/20 flex-shrink-0 bg-slate-50/30">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{t('tracking_gantt.tracking_panel_title')}</h3>
              </div>
              <div className="p-3 flex-1 overflow-auto space-y-1">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="task-item p-2 hover:bg-[hsl(var(--primary-soft))] transition-all cursor-pointer text-xs rounded-lg group"
                    onContextMenu={(e) => handleTaskContextMenu(e, task as JsonObject)}
                    onDoubleClick={() => handleTaskDoubleClick(task)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div 
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm" 
                          style={{ backgroundColor: task.color }}
                        />
                        <span className="truncate font-semibold text-slate-700 group-hover:text-primary transition-colors">{task.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 h-4.5 border-primary/20 text-primary bg-primary/5">
                        {Math.round(task.progress * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1 opacity-70">
                        <LineChart className="w-3 h-3" />
                        {t('tracking_gantt.plan_label')}: {
                          task.baselineStartDate 
                            ? new Date(task.baselineStartDate).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US') 
                            : t('tracking_gantt.not_available_short')
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas диаграмма в режиме TRACKING */}
            <div className="flex-1 bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
              <GanttCanvasController
                tasks={tasks}
                currentDate={currentDate}
                onCurrentDateChange={setCurrentDate}
                onTaskSelect={handleTaskSelect}
                onTaskDoubleClick={handleTaskDoubleClick}
                onTaskUpdate={handleTaskUpdate}
                mode="tracking"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Диалог редактирования */}
      {isDialogOpen && editingTaskId && (
        <TaskPropertiesDialog
          taskId={editingTaskId}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
};
