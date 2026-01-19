import React from 'react';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { TaskSheet } from '@/components/sheets/table/TaskSheet';
import { EventType, TaskEventData } from '@/types/EventFlowTypes';
import { useEventFlow } from '@/providers/hooks';
import { useProjectStore } from '@/store/projectStore';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useTaskDeletion } from '@/hooks/task/useTaskDeletion';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { useTranslation } from 'react-i18next';
import { Trash2, Info, Plus, ClipboardList, Filter, Download } from 'lucide-react';
import { CalendarMathService } from '@/domain/services/CalendarMathService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';

/**
 * Task Sheet компонент - Лист задач
 * 
 * Отображает все задачи проекта в табличном формате с возможностью редактирования.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const TaskSheetComponent: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType, 
  settings 
}) => {
  const { t } = useTranslation();
  const { emitEvent } = useEventFlow();
  const { tasks, updateTask, addTask } = useProjectStore();
  const { deleteTask, isDeletionAllowed } = useTaskDeletion();
  const { preferences } = useUserPreferences();
  const { showMenu } = useContextMenu();
  const helpContent = useHelpContent();

  // Обработчики событий с Event Flow интеграцией
  const handleAddTask = () => {
    const { schedule, calendar } = preferences as any;
    const calendarPrefs: CalendarPreferences = calendar || {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20
    };

    const startDate = schedule.newTasksStartToday ? new Date() : new Date(); // TODO: get project start date if not today
    
    // Используем CalendarMathService для расчета даты окончания
    const endDate = CalendarMathService.calculateFinishDate(
      startDate,
      { value: 1, unit: 'days' },
      calendarPrefs
    );

    const newTask = {
      id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: 'Новая задача',
      startDate: startDate,
      endDate: endDate,
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1,
      predecessors: []
    };
    addTask(newTask);
    
    const eventData: TaskEventData = {
      taskId: newTask.id,
      taskData: newTask,
      newValues: { description: 'Задача создана через Лист задач' }
    };
    emitEvent(EventType.TASK_CREATED, eventData);
  };

  const handleContextMenu = (event: React.MouseEvent, task: any) => {
    event.preventDefault();
    showMenu(ContextMenuType.TASK, {
      target: task,
      position: { x: event.clientX, y: event.clientY },
      actions: [
        { 
          label: t('sheets.task_info'), 
          onClick: () => { /* open dialog */ },
          icon: <Info size={14} className="text-primary" />
        },
        { divider: true },
        { 
          label: t('common.delete'), 
          onClick: () => deleteTask(task.id), 
          icon: <Trash2 size={14} className={isDeletionAllowed ? "text-red-500" : "text-gray-400"} />,
          disabled: !isDeletionAllowed
        }
      ]
    });
  };
  
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('navigation.task_sheet')}
        description={t('descriptions.task_sheet')}
        icon={<ClipboardList className="w-6 h-6" />}
        help={helpContent.TASK_SHEET}
        actionBar={{
          primaryAction: {
            label: t('sheets.add_task'),
            onClick: handleAddTask,
            icon: <Plus className="w-4 h-4" />,
            title: t('sheets.add_task_tooltip')
          },
          secondaryActions: [
            {
              label: t('common.filter'),
              onClick: () => {/* TODO: implement filter */},
              icon: <Filter className="w-4 h-4" />,
              variant: 'outline'
            },
            {
              label: t('common.export'),
              onClick: () => {/* TODO: implement export */},
              icon: <Download className="w-4 h-4" />,
              variant: 'outline'
            }
          ]
        }}
      />
      
      {/* Основной контент: Таблица задач */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <TaskSheet 
            tasks={tasks}
            variant="full"
            onTaskUpdate={updateTask}
            onDeleteTasks={(ids) => ids.forEach(id => deleteTask(id))}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>
    </div>
  );
};

