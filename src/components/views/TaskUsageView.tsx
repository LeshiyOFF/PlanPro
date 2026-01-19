import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { TaskUsageSheet } from '@/components/sheets/table/TaskUsageSheet';
import { ITaskUsage } from '@/domain/sheets/entities/ITaskUsage';
import { useProjectStore } from '@/store/projectStore';
import { useHelpContent } from '@/hooks/useHelpContent';
import { Plus, BarChart3, Download, Filter } from 'lucide-react';

/**
 * Task Usage View компонент - Использование задач
 * 
 * Отображает анализ распределения работ по времени для каждой задачи.
 * Включает статистические карточки и детальную таблицу.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const TaskUsageView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType, 
  settings 
}) => {
  const { t } = useTranslation();
  const { tasks, addTask, updateTask } = useProjectStore();
  const helpContent = useHelpContent();

  // Статистика задач
  const stats = useMemo(() => {
    const active = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const completed = tasks.filter(t => t.progress >= 100).length;
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const notStarted = tasks.filter(t => t.progress === 0).length;
    return { active: tasks.length, completed, inProgress, notStarted };
  }, [tasks]);

  // Преобразование доменных задач в формат Usage
  const taskUsageData: ITaskUsage[] = useMemo(() => tasks.map(task => ({
    id: task.id,
    taskName: task.name,
    startDate: task.startDate,
    endDate: task.endDate,
    duration: task.duration,
    percentComplete: task.progress,
    resources: t('sheets.not_assigned')
  })), [tasks, t]);

  const handleAddTask = () => {
    const newTask = {
      id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: t('sheets.new_task') || 'Новая задача',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 0,
      color: '#007bff',
      level: 1,
      predecessors: []
    };
    addTask(newTask);
  };

  const handleUpdate = (id: string, field: string, value: unknown) => {
    const updates: Record<string, unknown> = {};
    if (field === 'taskName') updates.name = value;
    if (field === 'percentComplete') updates.progress = value;
    if (field === 'startDate') updates.startDate = value;
    if (field === 'endDate') updates.endDate = value;
    
    updateTask(id, updates);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
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
              label: t('common.filter'),
              onClick: () => {/* TODO: implement filter */},
              icon: <Filter className="w-4 h-4" />,
              variant: 'outline'
            },
            {
              label: t('sheets.export_data'),
              onClick: () => {/* TODO: implement export */},
              icon: <Download className="w-4 h-4" />,
              variant: 'outline'
            }
          ]
        }}
      />
      
      {/* Основной контент */}
      <div className="flex-1 overflow-hidden p-4">
        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card border rounded-lg p-4 bg-primary/5 shadow-sm soft-border">
            <h3 className="font-medium text-primary text-sm">{t('sheets.active_stat')}</h3>
            <p className="text-2xl font-bold text-primary">{stats.active}</p>
          </div>
          <div className="stat-card border rounded-lg p-4 bg-green-50/30 shadow-sm soft-border">
            <h3 className="font-medium text-green-700 text-sm">{t('sheets.completed_stat')}</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="stat-card border rounded-lg p-4 bg-amber-50/30 shadow-sm soft-border">
            <h3 className="font-medium text-amber-700 text-sm">{t('sheets.in_progress_stat')}</h3>
            <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
          </div>
          <div className="stat-card border rounded-lg p-4 bg-slate-50/30 shadow-sm soft-border">
            <h3 className="font-medium text-slate-700 text-sm">{t('sheets.not_started_stat')}</h3>
            <p className="text-2xl font-bold text-slate-600">{stats.notStarted}</p>
          </div>
        </div>
        
        {/* Таблица использования задач */}
        <div className="h-[calc(100%-140px)] bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
          <TaskUsageSheet
            data={taskUsageData}
            onUpdate={handleUpdate}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

