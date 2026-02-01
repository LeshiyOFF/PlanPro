import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { TaskUsageSheet } from '@/components/sheets/table/TaskUsageSheet';
import { ProfessionalSheetHandle } from '@/components/sheets/table/ProfessionalSheet';
import { TaskUsageStatsCard } from './taskusage/TaskUsageStatsCard';
import { useProjectStore, createTaskFromView } from '@/store/projectStore';
import { Task, ResourceAssignment } from '@/store/project/interfaces';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useTaskDeletion } from '@/hooks/task/useTaskDeletion';
import { useTaskUsageStats } from '@/hooks/task/useTaskUsageStats';
import { useTaskUsageData } from '@/hooks/task/useTaskUsageData';
import { useToast } from '@/hooks/use-toast';
import { TaskPropertiesDialog } from '@/components/dialogs/TaskPropertiesDialog';
import { getElectronAPI } from '@/utils/electronAPI';
import { Plus, BarChart3, Download, Loader2 } from 'lucide-react';
import type { CellValue } from '@/types/sheet/CellValueTypes';
import type { JsonObject, JsonValue } from '@/types/json-types';

/** Допустимые значения полей при обновлении задачи из Task Usage таблицы */
type TaskUsageFieldValue = string | number | Date | ResourceAssignment[];

/** Task Usage View - Использование задач с статистикой, tooltips и экспортом @version 9.0 */
export const TaskUsageView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({
  viewType: _viewType,
  settings: _settings
}) => {
  const { t } = useTranslation();
  const { tasks, resources, addTask, updateTask } = useProjectStore();
  const { deleteTask } = useTaskDeletion();
  const helpContent = useHelpContent();
  const { toast } = useToast();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPropertiesDialogOpen, setIsPropertiesDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const sheetRef = useRef<ProfessionalSheetHandle>(null);

  // Статистика с корректной логикой (progress 0-1)
  const stats = useTaskUsageStats(tasks);
  
  // Данные для таблицы с вычислённой длительностью и маппингом ресурсов
  const taskUsageData = useTaskUsageData(tasks, resources);

  const handleAddTask = () => {
    const newTask = createTaskFromView({
      id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: t('sheets.new_task') || 'Новая задача',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 0,
      color: '#007bff',
      level: 1,
      predecessors: []
    });
    addTask(newTask);
  };

  const handleUpdateInner = (id: string, field: string, value: TaskUsageFieldValue) => {
    const updates: Partial<Task> = {};

    if (field === 'taskName' && typeof value === 'string') {
      updates.name = value;
    } else if (field === 'percentComplete' && typeof value === 'number') {
      updates.progress = Math.max(0, Math.min(1, value / 100));
    } else if (field === 'startDate' && value instanceof Date) {
      updates.startDate = value;
    } else if (field === 'endDate' && value instanceof Date) {
      updates.endDate = value;
    } else if (field === 'resourceAssignments' && Array.isArray(value)) {
      updates.resourceAssignments = value as ResourceAssignment[];
    }

    if (Object.keys(updates).length > 0) {
      updateTask(id, updates);
    }
  };

  const handleUpdate = (id: string, field: string, value: CellValue) => {
    if (value == null) return;
    handleUpdateInner(id, field, value as TaskUsageFieldValue);
  };

  const handleExport = async () => {
    if (!sheetRef.current || isExporting) return;
    const api = getElectronAPI();
    if (!api?.showSaveDialog || !api?.saveBinaryFile) return;
    try {
      setIsExporting(true);
      const result = await api.showSaveDialog({
        title: t('common.export') || 'Экспорт',
        defaultPath: `TaskUsage_${new Date().toISOString().split('T')[0]}.csv`,
        filters: [{ name: 'CSV (Excel)', extensions: ['csv'] }]
      } as Record<string, JsonObject>);
      if (result.canceled || !result.filePath) return;
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
      console.error('TaskUsage Export failed:', error);
      toast({
        variant: "destructive",
        title: t('common.error') || 'Ошибка',
        description: t('sheets.export_error') || 'Не удалось экспортировать данные',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <TwoTierHeader
        title={t('navigation.task_usage')}
        description={t('descriptions.task_usage')}
        icon={<BarChart3 className="w-6 h-6" />}
        help={helpContent.TASK_USAGE}
        actionBar={{
          primaryAction: {
            label: t('sheets.add_task'),
            onClick: handleAddTask,
            icon: <Plus className="w-4 h-4" />
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
      
      <div className="flex-1 overflow-hidden p-4">
        {/* Статистические карточки с tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <TaskUsageStatsCard
            title={t('sheets.active_stat')}
            value={stats.total}
            tooltip={t('sheets.active_stat_tooltip')}
            colorScheme="primary"
          />
          <TaskUsageStatsCard
            title={t('sheets.completed_stat')}
            value={stats.completed}
            tooltip={t('sheets.completed_stat_tooltip')}
            colorScheme="green"
          />
          <TaskUsageStatsCard
            title={t('sheets.in_progress_stat')}
            value={stats.inProgress}
            tooltip={t('sheets.in_progress_stat_tooltip')}
            colorScheme="amber"
          />
          <TaskUsageStatsCard
            title={t('sheets.not_started_stat')}
            value={stats.notStarted}
            tooltip={t('sheets.not_started_stat_tooltip')}
            colorScheme="slate"
          />
        </div>
        
        <div className="h-[calc(100%-140px)] bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <TaskUsageSheet
            ref={sheetRef}
            data={taskUsageData}
            resources={resources}
            onUpdate={handleUpdate}
            onDeleteTask={deleteTask}
            onShowTaskProperties={(taskId) => {
              setSelectedTaskId(taskId);
              setIsPropertiesDialogOpen(true);
            }}
            className="w-full h-full"
          />
        </div>
      </div>

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
