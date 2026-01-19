import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { ResourceUsageSheet } from '@/components/sheets/table/ResourceUsageSheet';
import { IResourceUsage } from '@/domain/sheets/entities/IResourceUsage';
import { useProjectStore } from '@/store/projectStore';
import { useHelpContent } from '@/hooks/useHelpContent';
import { Plus, PieChart, BarChart2, Download, Filter } from 'lucide-react';
import { ResourceLoadingService } from '@/domain/resources/services/ResourceLoadingService';
import { ResourceHistogramChart } from './resources/ResourceHistogramChart';

/**
 * Resource Usage View компонент - Использование ресурсов
 * 
 * Отображает детальную загрузку ресурсов по периодам с гистограммой.
 * Включает статистические карточки и детальную таблицу.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const ResourceUsageView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType, 
  settings 
}) => {
  const { t } = useTranslation();
  const { resources, tasks, addResource, updateResource } = useProjectStore();
  const helpContent = useHelpContent();
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const loadingService = useMemo(() => new ResourceLoadingService(), []);

  // Выбор первого ресурса по умолчанию для гистограммы
  useEffect(() => {
    if (!selectedResourceId && resources.length > 0) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  // Статистика ресурсов
  const stats = useMemo(() => ({
    available: resources.filter(r => r.available).length,
    busy: resources.filter(r => r.maxUnits > 0).length,
    overloaded: resources.filter(r => r.maxUnits > 1).length
  }), [resources]);

  // Маппинг глобальных ресурсов в формат Usage
  const resourceUsageData: IResourceUsage[] = useMemo(() => resources.map(r => ({
    id: r.id,
    resourceName: r.name,
    assignedPercent: r.maxUnits,
    availablePercent: 1 - r.maxUnits,
    status: r.available ? t('sheets.status_available') : t('sheets.status_unavailable'),
    workload: r.maxUnits > 1 ? t('sheets.workload_overload') : t('sheets.workload_normal')
  })), [resources, t]);

  // Данные для гистограммы выбранного ресурса
  const histogramData = useMemo(() => {
    const resource = resources.find(r => r.id === selectedResourceId);
    if (!resource) return null;
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    
    return loadingService.calculateHistogram(resource, tasks, start, end);
  }, [selectedResourceId, resources, tasks, loadingService]);

  const handleUpdate = (id: string, field: string, value: unknown) => {
    const updates: Record<string, unknown> = {};
    if (field === 'resourceName') updates.name = value;
    if (field === 'assignedPercent') updates.maxUnits = value;
    
    updateResource(id, updates);
  };

  const handleRowClick = (row: IResourceUsage) => {
    setSelectedResourceId(row.id);
  };

  const handleAddResource = () => {
    const newId = `RES-${String(resources.length + 1).padStart(3, '0')}`;
    addResource({
      id: newId,
      name: t('sheets.new_resource') || 'Новый ресурс',
      type: 'Work',
      maxUnits: 1,
      standardRate: 0,
      overtimeRate: 0,
      costPerUse: 0,
      available: true
    });
  };

  const handleAnalyzeWorkload = () => {
    console.log("Анализ нагрузки...");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('navigation.resource_usage')}
        description={t('descriptions.resource_usage')}
        icon={<PieChart className="w-6 h-6" />}
        help={helpContent.RESOURCE_USAGE}
        actionBar={{
          primaryAction: {
            label: t('sheets.add_resource'),
            onClick: handleAddResource,
            icon: <Plus className="w-4 h-4" />
          },
          secondaryActions: [
            {
              label: t('sheets.analyze_load'),
              onClick: handleAnalyzeWorkload,
              icon: <BarChart2 className="w-4 h-4" />,
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
      
      {/* Основной контент */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          <div className="stat-card border rounded-lg p-4 bg-green-50/30 shadow-sm soft-border">
            <h3 className="font-medium text-green-700 text-sm">{t('sheets.available_stat')}</h3>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </div>
          <div className="stat-card border rounded-lg p-4 bg-primary/5 shadow-sm soft-border">
            <h3 className="font-medium text-primary text-sm">{t('sheets.busy_stat')}</h3>
            <p className="text-2xl font-bold text-primary">{stats.busy}</p>
          </div>
          <div className="stat-card border rounded-lg p-4 bg-red-50/30 shadow-sm soft-border">
            <h3 className="font-medium text-red-700 text-sm">{t('sheets.overload_stat')}</h3>
            <p className="text-2xl font-bold text-red-600">{stats.overloaded}</p>
          </div>
        </div>
        
        {/* Таблица использования ресурсов */}
        <div className="flex-1 min-h-[200px] bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
          <ResourceUsageSheet
            data={resourceUsageData}
            onUpdate={handleUpdate}
            onRowClick={handleRowClick}
            className="w-full h-full"
          />
        </div>

        {/* Гистограмма загрузки */}
        {histogramData && (
          <div className="flex-shrink-0">
            <ResourceHistogramChart data={histogramData} />
          </div>
        )}
      </div>
    </div>
  );
};

