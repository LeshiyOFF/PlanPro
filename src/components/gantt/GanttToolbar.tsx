import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Settings, Activity, BarChart, Pin, Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { SafeTooltip } from '@/components/ui/tooltip';

interface GanttToolbarProps {
  tasksCount: number;
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  currentDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  onNavigateLeft: () => void;
  onNavigateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onSettingsClick?: () => void;
  onSaveBaseline?: () => void;
  mode: 'standard' | 'tracking';
  onModeToggle: () => void;
  isPulseActive?: boolean;
  onPulseToggle?: () => void;
  isCalculating?: boolean; // Новый проп для индикации расчёта
}

export const GanttToolbar: React.FC<GanttToolbarProps> = ({
  tasksCount,
  viewMode,
  onViewModeChange,
  currentDate,
  onDateSelect,
  onNavigateLeft,
  onNavigateRight,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onSettingsClick,
  onSaveBaseline,
  mode,
  onModeToggle,
  isPulseActive,
  onPulseToggle,
  isCalculating = false // Дефолтное значение
}) => {
  const { t } = useTranslation();

  return (
    <div className="gantt-toolbar flex flex-col sm:flex-row items-start sm:items-center p-3 border-b border-gray-200 bg-gray-50 gap-2">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full">
        <h3 className="text-sm font-medium text-gray-900 whitespace-nowrap">{t('gantt.title')}</h3>
        
        <div className="flex items-center gap-1 bg-white rounded border border-gray-300 p-1">
          {(['day', 'week', 'month'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onViewModeChange(m)}
              className={`h-7 px-2 text-xs rounded transition-colors ${viewMode === m ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              {t(`gantt.${m}`)}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 whitespace-nowrap">
          {t('gantt.tasks_count', { count: tasksCount })}
        </span>

        <SafeTooltip content={t('gantt.back')} side="bottom">
          <Button size="sm" variant="outline" onClick={onNavigateLeft} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </SafeTooltip>
        
        <div className="w-32">
          <DatePicker date={currentDate} onChange={onDateSelect} className="h-8 py-0 px-2 text-xs" />
        </div>
        
        <SafeTooltip content={t('gantt.forward')} side="bottom">
          <Button size="sm" variant="outline" onClick={onNavigateRight} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </SafeTooltip>

        <div className="hidden sm:block w-px h-6 bg-gray-300 mx-1" />
        
        <SafeTooltip content={t('gantt.zoom_out')} side="bottom">
          <Button size="sm" variant="outline" onClick={onZoomOut} className="h-8 w-8 p-0 hidden sm:flex">
            <ZoomOut className="h-4 w-4" />
          </Button>
        </SafeTooltip>
        
        <SafeTooltip content={t('gantt.zoom_in')} side="bottom">
          <Button size="sm" variant="outline" onClick={onZoomIn} className="h-8 w-8 p-0 hidden sm:flex">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </SafeTooltip>
        
        <SafeTooltip content={t('gantt.reset_zoom')} side="bottom">
          <Button size="sm" variant="outline" onClick={onFitToScreen} className="h-8 w-8 p-0 hidden sm:flex">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </SafeTooltip>

        <div className="hidden sm:block w-px h-6 bg-gray-300 mx-1" />
        
        <SafeTooltip content={t('gantt.settings')} side="bottom">
          <Button size="sm" variant="outline" onClick={onSettingsClick} className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </SafeTooltip>

        <SafeTooltip content={t('gantt.save_baseline', { defaultValue: 'Зафиксировать план' })} side="bottom">
          <Button size="sm" variant="outline" onClick={onSaveBaseline} className="h-8 w-8 p-0">
            <Pin className="h-4 w-4" />
          </Button>
        </SafeTooltip>

        <SafeTooltip content={isCalculating ? t('gantt.calculating', { defaultValue: 'Расчёт критического пути...' }) : t('gantt.pulse', { defaultValue: 'Пульс (Критический путь)' })} side="bottom">
          <Button 
            size="sm" 
            variant={isPulseActive ? 'default' : 'outline'} 
            onClick={onPulseToggle} 
            disabled={isCalculating}
            className={`h-8 w-8 p-0 ${isPulseActive ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : ''} ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`} 
          >
            {isCalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
          </Button>
        </SafeTooltip>

        <SafeTooltip content={mode === 'tracking' ? t('gantt.hide_baseline') : t('gantt.show_baseline')} side="bottom">
          <Button 
            size="sm" 
            variant={mode === 'tracking' ? 'default' : 'outline'} 
            onClick={onModeToggle} 
            className="h-8 w-8 p-0" 
          >
            <BarChart className="h-4 w-4" />
          </Button>
        </SafeTooltip>
      </div>
    </div>
  );
};
