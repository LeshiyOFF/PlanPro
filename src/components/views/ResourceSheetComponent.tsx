import React, { useRef, useState } from 'react';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { ResourceSheet } from '@/components/sheets/table/ResourceSheet';
import { ProfessionalSheetHandle } from '@/components/sheets/table/ProfessionalSheet';
import { Resource } from '@/types/resource-types';
import { useProjectStore } from '@/store/projectStore';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useHelpContent } from '@/hooks/useHelpContent';
import { useTranslation } from 'react-i18next';
import { Plus, Users, Download, Loader2, Calendar, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CalendarManager } from '@/components/calendar/CalendarManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { useCalendarValidation } from '@/hooks/useCalendarValidation';

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
  const { resources, addResource, updateResource, calendars } = useProjectStore();
  const { preferences } = useUserPreferences();
  const helpContent = useHelpContent();
  const { toast } = useToast();
  const { sanitizeCalendarId, isCalendarValid } = useCalendarValidation(calendars);
  
  const sheetRef = useRef<ProfessionalSheetHandle>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [calendarManagerOpen, setCalendarManagerOpen] = useState(false);
  const [calcHelpOpen, setCalcHelpOpen] = useState(false);

  const handleResourceUpdate = (id: string, updates: Partial<Resource>) => {
    updateResource(id, updates);
  };

  const handleDeleteResources = (ids: string[]) => {
    const { deleteResource } = useProjectStore.getState();
    ids.forEach(id => deleteResource(id));
  };

  const handleExport = async () => {
    if (!sheetRef.current) return;
    
    try {
      setIsExporting(true);
      
      const fileName = `Resources_${new Date().toISOString().split('T')[0]}.csv`;
      const resultDialog = await window.electronAPI.showSaveDialog({
        title: t('sheets.export_data'),
        defaultPath: fileName,
        filters: [{ name: 'CSV', extensions: ['csv'] }]
      });

      // Electron возвращает { filePath, canceled }
      const savePath = typeof resultDialog === 'object' ? resultDialog.filePath : resultDialog;

      if (!savePath) return;

      const blob = await sheetRef.current.exportToCSV();
      const arrayBuffer = await blob.arrayBuffer();
      const result = await window.electronAPI.saveBinaryFile(savePath, new Uint8Array(arrayBuffer));

      if (result.success) {
        toast({
          title: t('common.success'),
          description: t('sheets.export_success'),
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: t('common.error'),
        description: t('sheets.export_error'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddResource = () => {
    const { general } = preferences;
    
    // V2.0: Валидация календаря по умолчанию
    const defaultCalendarId = general.defaultCalendar || 'standard';
    const validatedCalendarId = sanitizeCalendarId(defaultCalendarId);
    
    if (validatedCalendarId !== defaultCalendarId) {
      console.warn('[ResourceSheet] Default calendar was sanitized:', 
        defaultCalendarId, '→', validatedCalendarId);
      
      toast({
        title: 'Предупреждение',
        description: `Календарь по умолчанию "${defaultCalendarId}" не найден. Используется "standard".`,
        variant: 'default',
      });
    }
    
    const newResource: Resource = {
      id: `RES-${String(resources.length + 1).padStart(3, '0')}`,
      name: `${t('sheets.new_resource') || 'Новый ресурс'} ${resources.length + 1}`,
      type: 'Work',
      maxUnits: 1,
      standardRate: general.defaultStandardRate || 0,
      overtimeRate: general.defaultOvertimeRate || 0,
      costPerUse: 0,
      available: true,
      calendarId: validatedCalendarId
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
              label: t('sheets.calc_help_title'),
              onClick: () => setCalcHelpOpen(true),
              icon: <HelpCircle className="w-4 h-4 text-primary" />,
              variant: 'outline'
            },
            {
              label: 'Календари',
              onClick: () => setCalendarManagerOpen(true),
              icon: <Calendar className="w-4 h-4" />,
              variant: 'outline'
            },
            {
              label: isExporting ? t('common.exporting') : t('common.export'),
              onClick: handleExport,
              icon: isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />,
              variant: 'outline',
              disabled: isExporting
            }
          ]
        }}
      />
      
      {/* Основной контент: Таблица ресурсов */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <ResourceSheet 
            ref={sheetRef}
            resources={resources}
            onResourceUpdate={handleResourceUpdate}
            onDeleteResources={handleDeleteResources}
          />
        </div>
      </div>

      {/* Диалог управления календарями */}
      <Dialog open={calendarManagerOpen} onOpenChange={setCalendarManagerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление календарями проекта</DialogTitle>
          </DialogHeader>
          <CalendarManager />
        </DialogContent>
      </Dialog>

      {/* Справка по расчетам */}
      <Dialog open={calcHelpOpen} onOpenChange={setCalcHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              {t('sheets.calc_help_title')}
            </DialogTitle>
            <DialogDescription className="py-2 space-y-4 text-sm leading-relaxed">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="font-bold text-blue-900 mb-1">👤 {t('sheets.work')}</p>
                <p className="text-blue-800">{t('sheets.calc_help_work')}</p>
              </div>
              
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="font-bold text-green-900 mb-1">📦 {t('sheets.material')}</p>
                <p className="text-green-800">{t('sheets.calc_help_material')}</p>
              </div>

              <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                <p className="font-bold text-amber-900 mb-1">💰 {t('sheets.cost')}</p>
                <p className="text-amber-800">{t('sheets.calc_help_cost')}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

