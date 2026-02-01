import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { useHelpContent } from '@/hooks/useHelpContent';
import { GanttLayout } from '@/components/gantt';
import { useProjectStore, createTaskFromView } from '@/store/projectStore';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { TaskPropertiesDialog } from '@/components/dialogs/TaskPropertiesDialog';
import { SplitTaskDialog } from '@/components/dialogs/task/SplitTaskDialog';
import { useTaskDeletion } from '@/hooks/task/useTaskDeletion';
import { GanttLeftPanel } from './gantt/GanttLeftPanel';
import { GanttRightPanel } from './gantt/GanttRightPanel';
import { useGanttContextMenu } from '@/hooks/task/useGanttContextMenu';
import { SummaryTaskDialog } from '@/components/dialogs/task/SummaryTaskDialog';
import { Plus, BarChart, Link2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * GanttView - Диаграмма Ганта
 * 
 * Профессиональное представление для планирования задач на временной шкале.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const GanttView: React.FC = () => {
  const { t } = useTranslation();
  const helpContent = useHelpContent();
  const store = useProjectStore();
  const { deleteTask, isDeletionAllowed } = useTaskDeletion();
  const { showMenu } = useContextMenu();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<'standard' | 'tracking'>('standard');
  const [dialogState, setDialogState] = useState({ 
    infoId: null as string | null, 
    splitId: null as string | null,
    summaryConfirmId: null as string | null
  });
  const [linkingTaskId, setLinkingTaskId] = useState<string | null>(null);

  // Задачи, которые нельзя выбрать при связывании
  const disabledTaskIds = useMemo(() => 
    linkingTaskId 
      ? store.tasks.filter(t => !store.isValidPredecessor(linkingTaskId, t.id)).map(t => t.id) 
      : [], 
    [store.tasks, linkingTaskId, store.isValidPredecessor]
  );

  const handleTaskSelect = useCallback((task: { id: string }) => {
    if (linkingTaskId && linkingTaskId !== task.id) {
      store.linkTasks(linkingTaskId, task.id);
      setLinkingTaskId(null);
    }
  }, [linkingTaskId, store]);

  const contextMenuActions = {
    onInfo: (id: string) => setDialogState({ ...dialogState, infoId: id }),
    onToggleMilestone: store.toggleMilestone,
    onStartLink: setLinkingTaskId,
    onUnlink: store.unlinkTasks,
    onSplit: (id: string) => setDialogState({ ...dialogState, splitId: id }),
    onMerge: store.mergeTask,
    onIndent: (id: string) => {
      const taskIndex = store.tasks.findIndex(t => t.id === id);
      if (taskIndex <= 0) return;
      
      const currentTask = store.tasks[taskIndex];
      // Ищем реального родителя: ближайшая задача выше с уровнем меньше текущего
      // Но так как мы делаем Indent, родителем станет задача ПРЯМО над ней, 
      // если её уровень равен текущему.
      const potentialParent = store.tasks[taskIndex - 1];
      
      if (potentialParent && potentialParent.level === currentTask.level && !potentialParent.isSummary) {
        setDialogState({ ...dialogState, summaryConfirmId: id });
      } else {
        store.indentTask(id);
      }
    },
    onOutdent: store.outdentTask,
    onMove: store.moveTask,
    onDelete: deleteTask
  };

  const onContextMenu = useGanttContextMenu(showMenu, t, contextMenuActions, isDeletionAllowed);

  const handleAddTask = useCallback(() => {
    store.addTask(createTaskFromView({ 
      id: `TASK-${store.tasks.length + 1}`, 
      name: `${t('sheets.new_task')} ${store.tasks.length + 1}`, 
      startDate: new Date(), 
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      progress: 0, 
      level: 1, 
      predecessors: [] 
    }));
  }, [store, t]);

  // Контролы режима связывания для ActionBar
  const linkingControls = linkingTaskId ? (
    <div className="flex items-center gap-2">
      <span className="text-sm text-primary font-medium flex items-center gap-1">
        <Link2 className="w-4 h-4" />
        {t('gantt.select_predecessor')}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLinkingTaskId(null)}
        className="h-8 px-2 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all rounded-md"
      >
        <XCircle className="w-4 h-4 mr-1" />
        {t('common.cancel')}
      </Button>
    </div>
  ) : null;

  return (
    <div className="gantt-view-root h-full w-full flex flex-col bg-white overflow-hidden">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('navigation.gantt')}
        description={t('descriptions.gantt')}
        icon={<BarChart className="w-6 h-6" />}
        help={helpContent.GANTT}
        actionBar={{
          primaryAction: {
            label: t('sheets.add_task'),
            onClick: handleAddTask,
            icon: <Plus className="w-4 h-4" />
          },
          controls: linkingControls
        }}
      />
      
      {/* Основной контент: GanttLayout */}
      <div className="flex-1 min-h-0 p-4">
        <div className="h-full w-full bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
          <GanttLayout 
            leftPanel={
              <GanttLeftPanel 
                tasks={store.tasks} 
                linkingTaskId={linkingTaskId} 
                t={t} 
                onAddTask={handleAddTask}
                onCancelLink={() => setLinkingTaskId(null)} 
                onTaskUpdate={store.updateTask} 
                onContextMenu={(e, task) => onContextMenu(e, task, store.tasks)} 
                onTaskSelect={handleTaskSelect} 
                onDeleteTask={deleteTask} 
                disabledTaskIds={disabledTaskIds} 
              />
            }
            rightPanel={
              <GanttRightPanel 
                tasks={store.tasks} 
                startDate={currentDate} 
                linkingTaskId={linkingTaskId} 
                mode={mode} 
                onCurrentDateChange={setCurrentDate} 
                onTaskUpdate={store.updateTask} 
                onTaskSelect={handleTaskSelect} 
                onModeChange={setMode} 
              />
            }
            initialLeftWidth={260} 
          />
        </div>
      </div>

      {/* Диалоги */}
      {dialogState.infoId && (
        <TaskPropertiesDialog 
          taskId={dialogState.infoId}
          isOpen={!!dialogState.infoId} 
          onClose={() => setDialogState({ ...dialogState, infoId: null })}
        />
      )}
      
      {dialogState.splitId && (
        <SplitTaskDialog 
          isOpen={!!dialogState.splitId} 
          onClose={(res) => { 
            setDialogState({ ...dialogState, splitId: null }); 
            if (res.success && res.data && res.data.splitDate != null) {
              store.splitTask(dialogState.splitId!, res.data.splitDate, res.data.gapDays ?? 0);
            }
          }} 
          data={{ 
            taskId: dialogState.splitId!, 
            taskName: store.tasks.find(t => t.id === dialogState.splitId!)?.name || '', 
            startDate: store.tasks.find(t => t.id === dialogState.splitId!)?.startDate || new Date(), 
            endDate: store.tasks.find(t => t.id === dialogState.splitId!)?.endDate || new Date() 
          }} 
        />
      )}

      {dialogState.summaryConfirmId && (
        <SummaryTaskDialog
          isOpen={!!dialogState.summaryConfirmId}
          onClose={(confirm) => {
            if (confirm) store.indentTask(dialogState.summaryConfirmId!);
            setDialogState({ ...dialogState, summaryConfirmId: null });
          }}
          parentTaskName={store.tasks[store.tasks.findIndex(t => t.id === dialogState.summaryConfirmId!) - 1]?.name || ''}
          subtaskName={store.tasks.find(t => t.id === dialogState.summaryConfirmId!)?.name || ''}
        />
      )}
    </div>
  );
};

