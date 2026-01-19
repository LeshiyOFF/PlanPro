import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { GanttCanvasController } from '@/components/gantt';
import { GanttChartOptionsDialog } from '@/components/dialogs/settings/GanttChartOptionsDialog';
import { useProjectStore } from '@/store/projectStore';
import { TaskInformationDialog } from '@/components/dialogs/task/TaskInformationDialog';
import { ViewType } from '@/types/ViewTypes';
import { LineChart, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [showSettings, setShowSettings] = useState(false);
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

  const handleDialogClose = useCallback((result: { success?: boolean; data?: Record<string, unknown> }) => {
    setIsDialogOpen(false);
    if (result && result.success && result.data && editingTaskId) {
      updateTask(editingTaskId, {
        name: result.data.name as string,
        progress: result.data.progress as number,
        startDate: result.data.startDate as Date,
        endDate: result.data.endDate as Date,
        notes: result.data.notes as string
      });
    }
    setEditingTaskId(null);
  }, [editingTaskId, updateTask]);

  const handleTaskUpdate = useCallback((taskId: string, updates: { startDate: Date; endDate: Date }) => {
    updateTask(taskId, updates);
  }, [updateTask]);

  const handleTaskContextMenu = useCallback((event: React.MouseEvent, taskData: Record<string, unknown>) => {
    event.preventDefault();
    showMenu(ContextMenuType.TASK, {
      target: { ...taskData, type: 'task' },
      position: { x: event.clientX, y: event.clientY }
    });
  }, [showMenu]);

  // Контролы для ActionBar
  const trackingControls = (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSettings(true)}
        title={t('gantt.settings')}
        className="h-9"
      >
        <Settings className="w-4 h-4 mr-1" />
        {t('common.settings')}
      </Button>
    </div>
  );

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
              onClick: () => {/* TODO: implement update progress */},
              icon: <RefreshCw className="w-4 h-4" />
            },
            controls: trackingControls
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
                    onContextMenu={(e) => handleTaskContextMenu(e, task as unknown as Record<string, unknown>)}
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
                startDate={currentDate}
                endDate={new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)}
                currentDate={currentDate}
                onCurrentDateChange={setCurrentDate}
                onTaskSelect={handleTaskSelect}
                onTaskDoubleClick={handleTaskDoubleClick}
                onTaskUpdate={handleTaskUpdate}
                onSettingsClick={() => setShowSettings(true)}
                mode="tracking"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Диалог настроек */}
      {showSettings && (
        <GanttChartOptionsDialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Диалог редактирования */}
      {isDialogOpen && editingTaskId && (
        <TaskInformationDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          data={{
            name: tasks.find(t => t.id === editingTaskId)?.name || '',
            progress: tasks.find(t => t.id === editingTaskId)?.progress || 0,
            startDate: tasks.find(t => t.id === editingTaskId)?.startDate || new Date(),
            endDate: tasks.find(t => t.id === editingTaskId)?.endDate || new Date(),
            taskId: editingTaskId,
            notes: (tasks.find(t => t.id === editingTaskId) as Record<string, unknown>)?.notes as string || ''
          }}
        />
      )}
    </>
  );
};
