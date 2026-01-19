import React from 'react';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { ResourceSheet } from '@/components/sheets/table/ResourceSheet';
import { Resource } from '@/types/resource-types';
import { useProjectStore } from '@/store/projectStore';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useTranslation } from 'react-i18next';
import { Plus, Users, Download, Filter } from 'lucide-react';

/**
 * Resource Sheet компонент - Лист ресурсов
 * 
 * Отображает все ресурсы проекта (людей, оборудование, материалы) в табличном формате.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 * 
 * @version 8.13
 */
export const ResourceSheetComponent: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType, 
  settings 
}) => {
  const { t } = useTranslation();
  const { resources, addResource, updateResource } = useProjectStore();
  const { preferences } = useUserPreferences();
  const helpContent = useHelpContent();

  const handleResourceUpdate = (id: string, updates: Partial<Resource>) => {
    updateResource(id, updates);
  };

  const handleAddResource = () => {
    const { general } = preferences;
    const newResource: Resource = {
      id: `RES-${String(resources.length + 1).padStart(3, '0')}`,
      name: t('sheets.new_resource') || 'Новый ресурс',
      type: 'Work',
      maxUnits: 1,
      standardRate: general.defaultStandardRate || 0,
      overtimeRate: general.defaultOvertimeRate || 0,
      costPerUse: 0,
      available: true
    };
    addResource(newResource);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('navigation.resource_sheet')}
        description={t('descriptions.resource_sheet')}
        icon={<Users className="w-6 h-6" />}
        help={helpContent.RESOURCE_SHEET}
        actionBar={{
          primaryAction: {
            label: t('sheets.add_resource'),
            onClick: handleAddResource,
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
              label: t('common.export'),
              onClick: () => {/* TODO: implement export */},
              icon: <Download className="w-4 h-4" />,
              variant: 'outline'
            }
          ]
        }}
      />
      
      {/* Основной контент: Таблица ресурсов */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <ResourceSheet 
            resources={resources}
            onResourceUpdate={handleResourceUpdate}
          />
        </div>
      </div>
    </div>
  );
};

