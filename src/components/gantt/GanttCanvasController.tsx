import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { ZoomIn, ZoomOut, RotateCcw, Calendar, Settings, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { GanttCanvas } from './GanttCanvas';

import { formatDate } from '@/utils/formatUtils';

interface GanttCanvasControllerProps {
  tasks?: any[];
  startDate?: Date;
  endDate?: Date;
  onTaskSelect?: (task: any) => void;
  onTaskDoubleClick?: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onSettingsClick?: () => void;
  zoomLevel?: number;
  currentDate?: Date;
  onCurrentDateChange?: (date: Date) => void;
  mode?: 'standard' | 'tracking';
  onModeChange?: (mode: 'standard' | 'tracking') => void;
}

/**
 * Gantt Canvas Controller
 * Provides toolbar and controls for the Gantt Canvas
 */
export const GanttCanvasController: React.FC<GanttCanvasControllerProps> = ({
  tasks,
  startDate,
  endDate,
  onTaskSelect,
  onTaskDoubleClick,
  onTaskUpdate,
  onSettingsClick,
  currentDate: propCurrentDate,
  onCurrentDateChange,
  mode = 'standard',
  onModeChange
}) => {
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showToday, setShowToday] = useState(true);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date());

  const handleModeToggle = useCallback(() => {
    const newMode = mode === 'standard' ? 'tracking' : 'standard';
    onModeChange?.(newMode);
  }, [mode, onModeChange]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoomLevel(1);
    setCurrentDate(new Date());
  }, []);

  const handleShowToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    onCurrentDateChange?.(today);
    setShowToday(true);
  }, [onCurrentDateChange]);

  const handleNavigateLeft = useCallback(() => {
    const daysToMove = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    const newDate = new Date(currentDate.getTime() - daysToMove * 24 * 60 * 60 * 1000);
    setCurrentDate(newDate);
    onCurrentDateChange?.(newDate);
  }, [viewMode, currentDate, onCurrentDateChange]);

  const handleNavigateRight = useCallback(() => {
    const daysToMove = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    const newDate = new Date(currentDate.getTime() + daysToMove * 24 * 60 * 60 * 1000);
    setCurrentDate(newDate);
    onCurrentDateChange?.(newDate);
  }, [viewMode, currentDate, onCurrentDateChange]);

  const handleViewModeChange = useCallback((mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
    // Adjust zoom based on view mode
    switch(mode) {
      case 'day':
        setZoomLevel(1.5);
        break;
      case 'week':
        setZoomLevel(1);
        break;
      case 'month':
        setZoomLevel(0.8);
        break;
    }
  }, []);

  return (
    <div className="gantt-controller flex flex-col h-full">
      {/* Toolbar */}
      <div className="gantt-toolbar flex flex-col sm:flex-row items-start sm:items-center p-3 border-b border-gray-200 bg-gray-50 gap-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full">
          <h3 className="text-sm font-medium text-gray-900 whitespace-nowrap">{t('gantt.title')}</h3>
          
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-white rounded border border-gray-300 p-1">
            <button
              onClick={() => handleViewModeChange('day')}
              className={`h-7 px-2 text-xs rounded transition-colors ${viewMode === 'day' ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              {t('gantt.day')}
            </button>
            <button
              onClick={() => handleViewModeChange('week')}
              className={`h-7 px-2 text-xs rounded transition-colors ${viewMode === 'week' ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              {t('gantt.week')}
            </button>
            <button
              onClick={() => handleViewModeChange('month')}
              className={`h-7 px-2 text-xs rounded transition-colors ${viewMode === 'month' ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              {t('gantt.month')}
            </button>
          </div>

          <span className="text-xs text-gray-500 whitespace-nowrap">
            {t('gantt.tasks_count', { count: tasks?.length || 0 })}
          </span>
          {/* Navigation Controls */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleNavigateLeft}
            className="h-8 w-8 p-0 flex-shrink-0"
            title={t('gantt.back')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant={showToday ? 'default' : 'outline'}
            onClick={handleShowToday}
            className="h-8 w-8 p-0 flex-shrink-0"
            title={t('gantt.today')}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleNavigateRight}
            className="h-8 w-8 p-0 flex-shrink-0"
            title={t('gantt.forward')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Zoom Controls */}
          <div className="hidden sm:block w-px h-6 bg-gray-300 mx-1 flex-shrink-0" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0 flex-shrink-0 hidden sm:flex"
            title={t('gantt.zoom_out')}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0 flex-shrink-0 hidden sm:flex"
            title={t('gantt.zoom_in')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleFitToScreen}
            className="h-8 w-8 p-0 flex-shrink-0 hidden sm:flex"
            title={t('gantt.reset_zoom')}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <div className="hidden sm:block w-px h-6 bg-gray-300 mx-1 flex-shrink-0" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={onSettingsClick}
            className="h-8 w-8 p-0 flex-shrink-0"
            title={t('gantt.settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={mode === 'tracking' ? 'default' : 'outline'}
            onClick={handleModeToggle}
            className="h-8 w-8 p-0 flex-shrink-0"
            title={mode === 'tracking' ? t('gantt.hide_baseline') : t('gantt.show_baseline')}
          >
            <Activity className="h-4 w-4" />
          </Button>
          
          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* TODO: Add mobile menu */}}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={t('gantt.more')}
            >
              <div className="h-4 w-4 flex flex-col justify-center gap-0.5">
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="gantt-canvas-wrapper flex-1 min-w-0 bg-white relative">
        <GanttCanvas
          tasks={tasks}
          startDate={currentDate}
          endDate={endDate}
          onTaskSelect={onTaskSelect}
          onTaskDoubleClick={onTaskDoubleClick}
          onTaskUpdate={onTaskUpdate}
          zoomLevel={zoomLevel}
          mode={mode}
        />
      </div>

      {/* Status Bar */}
      <div className="gantt-status flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>{t('gantt.view_label')}: {viewMode === 'day' ? t('gantt.day') : viewMode === 'week' ? t('gantt.week') : t('gantt.month')}</span>
          <span>{t('gantt.tasks_count', { count: tasks?.length || 0 })}</span>
          <span>{t('gantt.zoom_label')}: {Math.round(zoomLevel * 100)}%</span>
          <span>{t('gantt.date_label')}: {formatDate(currentDate)}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded ${showToday ? 'bg-slate-100 text-slate-800' : 'bg-gray-100 text-gray-600'}`}>
            {showToday ? t('gantt.today_on') : t('gantt.today_off')}
          </span>
          <span>{t('gantt.controls_hint')}</span>
        </div>
      </div>
    </div>
  );
};
