import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { ResourceUsageSheet } from '@/components/sheets/table/ResourceUsageSheet';
import { ProfessionalSheetHandle } from '@/components/sheets/table/ProfessionalSheet';
import { useProjectStore } from '@/store/projectStore';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useToast } from '@/hooks/use-toast';
import { Plus, PieChart, Download, Loader2 } from 'lucide-react';
import { ResourceLoadingService } from '@/domain/resources/services/ResourceLoadingService';
import { ResourceHistogramChart } from './resources/ResourceHistogramChart';
import { ResourceUsageStatsCard } from './resourceusage/ResourceUsageStatsCard';
import { useResourceUsageStats } from '@/hooks/resource/useResourceUsageStats';
import { useResourceUsageData } from '@/hooks/resource/useResourceUsageData';

/**
 * Resource Usage View компонент - Использование ресурсов
 * Отображает детальную загрузку ресурсов с гистограммой и статистикой.
 * @version 9.0
 */
export const ResourceUsageView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType, settings 
}) => {
  const { t } = useTranslation();
  const { resources, tasks, addResource, updateResource, deleteResource } = useProjectStore();
  const helpContent = useHelpContent();
  const { toast } = useToast();
  
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const sheetRef = useRef<ProfessionalSheetHandle>(null);
  const loadingService = useMemo(() => new ResourceLoadingService(), []);

  // Статистика с корректной логикой
  const stats = useResourceUsageStats(resources, tasks);
  
  // Данные таблицы с вычисленными значениями
  const resourceUsageData = useResourceUsageData(resources, tasks);

  // Выбор первого ресурса по умолчанию
  useEffect(() => {
    if (!selectedResourceId && resources.length > 0) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  // Вычисляем диапазон дат на основе реальных задач ресурса
  const histogramDateRange = useMemo(() => {
    if (!selectedResourceId || tasks.length === 0) return null;
    
    // Находим задачи, назначенные на выбранный ресурс
    const resourceTasks = tasks.filter(t => 
      t.resourceAssignments?.some(a => a.resourceId === selectedResourceId) ||
      t.resourceIds?.includes(selectedResourceId)
    );
    
    if (resourceTasks.length === 0) return null;
    
    // Находим минимальную и максимальную даты
    let minDate = new Date(resourceTasks[0].startDate);
    let maxDate = new Date(resourceTasks[0].endDate);
    
    resourceTasks.forEach(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      if (taskStart < minDate) minDate = taskStart;
      if (taskEnd > maxDate) maxDate = taskEnd;
    });
    
    // Добавляем буфер в 3 дня до и после
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 3);
    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(23, 59, 59, 999);
    
    return { start: minDate, end: maxDate };
  }, [selectedResourceId, tasks]);

  // Данные для гистограммы с динамическим диапазоном
  const histogramData = useMemo(() => {
    const resource = resources.find(r => r.id === selectedResourceId);
    if (!resource) return null;
    
    // Создаём новые Date объекты для избежания мутации
    let startDate: Date;
    let endDate: Date;
    
    if (histogramDateRange?.start) {
      startDate = new Date(histogramDateRange.start);
    } else {
      startDate = new Date();
    }
    
    if (histogramDateRange?.end) {
      endDate = new Date(histogramDateRange.end);
    } else {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
    }
    
    // Нормализуем время начала дня
    startDate.setHours(0, 0, 0, 0);
    
    return loadingService.calculateHistogram(resource, tasks, startDate, endDate);
  }, [selectedResourceId, resources, tasks, loadingService, histogramDateRange]);

  const handleUpdate = useCallback((id: string, field: string, value: unknown) => {
    const updates: Record<string, unknown> = {};
    if (field === 'resourceName') updates.name = value;
    if (field === 'assignedPercent') updates.maxUnits = value;
    updateResource(id, updates);
  }, [updateResource]);

  const handleRowClick = useCallback((row: { id: string }) => {
    setSelectedResourceId(row.id);
  }, []);

  const handleDeleteResource = useCallback((resourceId: string) => {
    deleteResource(resourceId);
  }, [deleteResource]);

  const handleAddResource = useCallback(() => {
    const newId = `RES-${String(resources.length + 1).padStart(3, '0')}`;
    addResource({
      id: newId, name: `${t('sheets.new_resource')} ${resources.length + 1}`,
      type: 'Work', maxUnits: 1, standardRate: 0, overtimeRate: 0, costPerUse: 0, available: true
    });
  }, [resources.length, addResource, t]);

  const handleExport = useCallback(async () => {
    if (!sheetRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const result = await window.electronAPI.showSaveDialog({
        title: t('common.export'),
        defaultPath: `ResourceUsage_${new Date().toISOString().split('T')[0]}.csv`,
        filters: [{ name: 'CSV (Excel)', extensions: ['csv'] }]
      });
      if (result.canceled || !result.filePath) return;
      
      const blob = await sheetRef.current.exportToCSV();
      const arrayBuffer = await blob.arrayBuffer();
      const saveResult = await window.electronAPI.saveBinaryFile(result.filePath, arrayBuffer);
      
      if (saveResult.success) {
        toast({ title: t('common.success'), description: t('sheets.export_success') });
      } else {
        throw new Error(saveResult.error);
      }
    } catch (error) {
      console.error('ResourceUsage Export failed:', error);
      toast({ variant: "destructive", title: t('common.error'), description: t('sheets.export_error') });
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, t, toast]);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <TwoTierHeader
        title={t('navigation.resource_usage')}
        description={t('descriptions.resource_usage')}
        icon={<PieChart className="w-6 h-6" />}
        help={helpContent.RESOURCE_USAGE}
        actionBar={{
          primaryAction: { label: t('sheets.add_resource'), onClick: handleAddResource, icon: <Plus className="w-4 h-4" /> },
          secondaryActions: [{
            label: isExporting ? t('common.exporting') : t('common.export'),
            onClick: handleExport,
            icon: isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />,
            variant: 'outline', disabled: isExporting
          }]
        }}
      />
      
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
        {/* Статистические карточки с tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          <ResourceUsageStatsCard title={t('sheets.available_stat')} value={stats.available}
            tooltip={t('sheets.available_stat_tooltip')} colorScheme="green" />
          <ResourceUsageStatsCard title={t('sheets.busy_stat')} value={stats.busy}
            tooltip={t('sheets.busy_stat_tooltip')} colorScheme="primary" />
          <ResourceUsageStatsCard title={t('sheets.overload_stat')} value={stats.overloaded}
            tooltip={t('sheets.overload_stat_tooltip')} colorScheme="red" />
        </div>
        
        {/* Таблица */}
        <div className="flex-1 min-h-[200px] bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <ResourceUsageSheet ref={sheetRef} data={resourceUsageData} onUpdate={handleUpdate}
            onRowClick={handleRowClick} onDeleteResource={handleDeleteResource} className="w-full h-full" />
        </div>

        {/* Гистограмма */}
        {histogramData && (
          <div className="flex-shrink-0">
            <ResourceHistogramChart data={histogramData} />
          </div>
        )}
      </div>
    </div>
  );
};
