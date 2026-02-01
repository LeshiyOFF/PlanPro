import React, { useRef, useState } from 'react';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { TaskSheet } from '@/components/sheets/table/TaskSheet';
import { ProfessionalSheetHandle } from '@/components/sheets/table/ProfessionalSheet';
import { EventType, TaskEventData } from '@/types/EventFlowTypes';
import type { Task as CatalogTask, StrictData } from '@/types/Master_Functionality_Catalog';
import { useEventFlow } from '@/providers/hooks';
import { useProjectStore, createTaskFromView } from '@/store/projectStore';
import { Task } from '@/store/project/interfaces';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useTaskDeletion } from '@/hooks/task/useTaskDeletion';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { useTranslation } from 'react-i18next';
import { Plus, ClipboardList, Download, Loader2 } from 'lucide-react';
import { CalendarMathService } from '@/domain/services/CalendarMathService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';
import { useToast } from '@/hooks/use-toast';
import { TaskPropertiesDialog } from '@/components/dialogs/TaskPropertiesDialog';
import { getElectronAPI } from '@/utils/electronAPI';
import type { JsonObject, JsonValue } from '@/types/json-types';

/**
 * Task Sheet компонент - Лист задач
 * 
 * Отображает все задачи проекта в табличном формате с возможностью редактирования.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.16
 */
export const TaskSheetComponent: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({
  viewType: _viewType,
  settings: _settings
}) => {
  const { t } = useTranslation();
  const { dispatch: emitEvent } = useEventFlow();
  const { tasks, updateTask, addTask } = useProjectStore();
  const { deleteTask } = useTaskDeletion();
  const { preferences } = useUserPreferences();
  const { showMenu } = useContextMenu();
  const { toast } = useToast();
  const helpContent = useHelpContent();
  
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPropertiesDialogOpen, setIsPropertiesDialogOpen] = useState(false);
  const sheetRef = useRef<ProfessionalSheetHandle>(null);

  // Обработчики событий с Event Flow интеграцией
  const handleAddTask = () => {
    const schedulePrefs = preferences.schedule;
    const calendarPrefs: CalendarPreferences = preferences.calendar ?? {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20
    };

    const startDate = schedulePrefs.newTasksStartToday ? new Date() : (tasks.length > 0 ? new Date(Math.min(...tasks.map(t => t.startDate.getTime()))) : new Date());
    
    // Используем CalendarMathService для расчета даты окончания
    const endDate = CalendarMathService.calculateFinishDate(
      startDate,
      { value: 1, unit: 'days' },
      calendarPrefs
    );

    const payload = {
      id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: t('sheets.new_task') || 'Новая задача',
      startDate: startDate,
      endDate: endDate,
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1,
      predecessors: [] as string[]
    };
    const newTask = createTaskFromView(payload);
    addTask(newTask);
    
    const eventData: TaskEventData = {
      taskId: newTask.id,
      taskData: newTask as CatalogTask,
      newValues: { description: 'Задача создана через Лист задач' }
    };
    emitEvent({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      type: EventType.TASK_CREATED,
      timestamp: new Date(),
      source: 'TaskSheetComponent',
      data: eventData as StrictData
    });
  };

  /**
   * Экспорт данных таблицы в CSV (Excel)
   */
  const handleExport = async () => {
    if (!sheetRef.current || isExporting) return;
    const api = getElectronAPI();
    if (!api?.showSaveDialog || !api?.saveBinaryFile) return;
    try {
      setIsExporting(true);
      const result = await api.showSaveDialog({
        title: t('common.export') || 'Экспорт',
        defaultPath: `Tasks_${new Date().toISOString().split('T')[0]}.csv`,
        filters: [{ name: 'CSV (Excel)', extensions: ['csv'] }]
      } as Record<string, JsonObject>);
      if (result.canceled || !result.filePath) {
        setIsExporting(false);
        return;
      }
      const blob = await sheetRef.current.exportToCSV();
      const arrayBuffer = await blob.arrayBuffer();
      const saveResult = await api.saveBinaryFile(result.filePath, arrayBuffer);
      if (saveResult.success) {
        toast({
          title: t('common.success') || 'Успех',
          description: t('sheets.export_success') || 'Данные успешно экспортированы',
        });
      } else {
        throw new Error(saveResult.error);
      }
    } catch (error) {
      console.error('Task Sheet Export failed:', error);
      toast({
        variant: "destructive",
        title: t('common.error') || 'Ошибка',
        description: t('sheets.export_error') || 'Не удалось экспортировать данные',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, task: Task) => {
    event.preventDefault();
    showMenu(ContextMenuType.TASK, {
      target: {
        ...task,
        type: 'task',
        onShowProperties: async (taskForProps: Task) => {
          setSelectedTaskId(taskForProps.id);
          setIsPropertiesDialogOpen(true);
        },
        onDelete: async (taskToDelete: Task) => {
          deleteTask(taskToDelete.id);
        }
      } as JsonObject,
      position: { x: event.clientX, y: event.clientY }
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
              label: isExporting ? t('common.exporting') || 'Экспорт...' : t('common.export'),
              onClick: handleExport,
              icon: isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />,
              variant: 'outline',
              disabled: isExporting
            }
          ]
        }}
      />
      
      {/* Основной контент: Таблица задач */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
          <TaskSheet 
            ref={sheetRef}
            tasks={tasks}
            variant="full"
            onTaskUpdate={updateTask}
            onDeleteTasks={(ids) => ids.forEach(id => deleteTask(id))}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>

      {/* Диалог свойств задачи */}
      {selectedTaskId && (
        <TaskPropertiesDialog
          taskId={selectedTaskId}
          isOpen={isPropertiesDialogOpen}
          onClose={() => {
            setIsPropertiesDialogOpen(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </div>
  );
};
