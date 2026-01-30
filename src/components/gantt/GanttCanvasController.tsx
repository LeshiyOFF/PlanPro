import React, { useState, useCallback, useRef } from 'react';
import { GanttCanvas } from './GanttCanvas';
import { ProfessionalGanttHandle } from './ProfessionalGantt';
import { GanttNavigationService } from '@/services/GanttNavigationService';
import { Task } from '@/store/project/interfaces';
import { GanttToolbar } from './GanttToolbar';
import { GanttStatusBar } from './GanttStatusBar';
import { GanttSettingsDialog } from '@/components/dialogs/GanttSettingsDialog';
import { GanttNavigationWarnings } from './GanttNavigationWarnings';
import { BaselineManagerDialog } from '../dialogs/BaselineManagerDialog';
import { TaskPropertiesDialog } from '../dialogs/TaskPropertiesDialog';
import { useAppStore } from '@/store/appStore';
import { useProjectStore } from '@/store/projectStore';
import { useTranslation } from 'react-i18next';

interface GanttCanvasControllerProps {
  tasks?: any[];
  onTaskSelect?: (task: any) => void;
  onTaskDoubleClick?: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onSettingsClick?: () => void;
  currentDate?: Date;
  onCurrentDateChange?: (date: Date) => void;
  mode?: 'standard' | 'tracking';
  onModeChange?: (mode: 'standard' | 'tracking') => void;
}

export const GanttCanvasController: React.FC<GanttCanvasControllerProps> = ({
  tasks,
  onTaskSelect,
  onTaskDoubleClick,
  onTaskUpdate,
  onSettingsClick,
  currentDate: propCurrentDate,
  onCurrentDateChange,
  mode = 'standard',
  onModeChange
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showToday, setShowToday] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date());
  const [forcedEndDate, setForcedEndDate] = useState<Date | null>(null);
  const [targetNavigationDate, setTargetNavigationDate] = useState<Date | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [showEmptyDateWarning, setShowEmptyDateWarning] = useState(false);
  const [showLargeJumpWarning, setShowLargeJumpWarning] = useState(false);
  
  const isPulseActive = useAppStore(state => state.ui.isPulseActive);
  const setPulseActive = useAppStore(state => (active: boolean) => state.setUIState({ isPulseActive: active }));
  const { recalculateCriticalPath, saveBaseline } = useProjectStore();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBaselineManagerOpen, setIsBaselineManagerOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isCalculatingCriticalPath, setIsCalculatingCriticalPath] = useState(false);

  const ganttRef = useRef<ProfessionalGanttHandle>(null);

  const handleModeToggle = useCallback(() => {
    onModeChange?.(mode === 'standard' ? 'tracking' : 'standard');
  }, [mode, onModeChange]);

  const handlePulseToggle = useCallback(async () => {
    if (!isPulseActive) {
      // Trigger REAL calculation in Java to get CPM data
      setIsCalculatingCriticalPath(true);
      try {
        await recalculateCriticalPath();
      } catch (error) {
        console.error('[GanttCanvasController] Critical path calculation failed:', error);
      } finally {
        setIsCalculatingCriticalPath(false);
      }
    }
    setPulseActive(!isPulseActive);
  }, [isPulseActive, setPulseActive, recalculateCriticalPath]);

  const handleSaveBaseline = useCallback(() => {
    setIsBaselineManagerOpen(true);
  }, []);

  const handleTaskDoubleClick = useCallback((task: Task) => {
    setEditingTaskId(task.id);
  }, []);

  const handleZoomIn = useCallback(() => setZoomLevel(prev => Math.min(prev + 0.1, 3)), []);
  const handleZoomOut = useCallback(() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5)), []);
  const handleFitToScreen = useCallback(() => { 
    setZoomLevel(1); 
    setCurrentDate(new Date()); 
    setForcedEndDate(null); 
    setTargetNavigationDate(null);
  }, []);

  const performScroll = useCallback((date: Date) => {
    console.log(`[GanttCanvasController] Requesting navigation to:`, date.toLocaleDateString());
    // Устанавливаем целевую дату для ProfessionalGantt
    setForcedEndDate(date);
    setTargetNavigationDate(date);
    
    // Обновляем текущую дату для UI компонентов
    setCurrentDate(date);
    onCurrentDateChange?.(date);
    setShowToday(false);
  }, [onCurrentDateChange]);

  const handleNavigationComplete = useCallback(() => {
    console.log(`[GanttCanvasController] Navigation completed successfully`);
    setTargetNavigationDate(null);
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;
    console.log(`[GanttCanvasController] handleDateSelect:`, date.toLocaleDateString());
    
    // 1. Проверка на безопасность прыжка (производительность)
    const safety = GanttNavigationService.checkNavigationSafety(date, viewMode);
    if (!safety.isSafe) {
      console.warn(`[GanttCanvasController] Navigation unsafe:`, safety);
      setPendingDate(date);
      setShowLargeJumpWarning(true);
      return;
    }

    // 2. Проверка на наличие задач на выбранную дату
    const hasTasks = GanttNavigationService.hasTasksAtDate(date, tasks || []);
    console.log(`[GanttCanvasController] hasTasksAtDate:`, hasTasks);
    if (!hasTasks) {
      setPendingDate(date);
      setShowEmptyDateWarning(true);
    } else {
      performScroll(date);
    }
  }, [tasks, performScroll, viewMode]);

  const confirmLargeJump = useCallback(() => {
    if (pendingDate) {
      setViewMode('month');
      setZoomLevel(0.8);
      performScroll(pendingDate);
      setPendingDate(null);
    }
    setShowLargeJumpWarning(false);
  }, [pendingDate, performScroll]);

  const confirmEmptyDateNavigation = useCallback(() => {
    if (pendingDate) {
      performScroll(pendingDate);
      setPendingDate(null);
    }
    setShowEmptyDateWarning(false);
  }, [pendingDate, performScroll]);

  const handleNavigate = useCallback((dir: 'left' | 'right') => {
    const current = ganttRef.current?.getCurrentScroll() || 0;
    const next = GanttNavigationService.calculateNextScroll(dir, current, zoomLevel * 300);
    ganttRef.current?.scrollToPosition(next);
    setShowToday(false);
  }, [zoomLevel]);

  const handleViewModeChange = useCallback((m: 'day' | 'week' | 'month') => {
    setViewMode(m);
    setZoomLevel(m === 'day' ? 1.5 : m === 'week' ? 1 : 0.8);
  }, []);

  return (
    <div className="gantt-controller flex flex-col h-full">
      <GanttToolbar 
        tasksCount={tasks?.length || 0} viewMode={viewMode} onViewModeChange={handleViewModeChange}
        currentDate={currentDate} onDateSelect={handleDateSelect}
        onNavigateLeft={() => handleNavigate('left')} onNavigateRight={() => handleNavigate('right')}
        onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFitToScreen={handleFitToScreen}
        onSettingsClick={() => setIsSettingsOpen(true)} 
        onSaveBaseline={handleSaveBaseline}
        mode={mode} 
        onModeToggle={handleModeToggle}
        isPulseActive={isPulseActive}
        onPulseToggle={handlePulseToggle}
        isCalculating={isCalculatingCriticalPath}
      />
      <div className="gantt-canvas-wrapper flex-1 min-w-0 bg-white relative">
        <GanttCanvas 
          ref={ganttRef} tasks={tasks} startDate={currentDate} zoomLevel={zoomLevel} mode={mode}
          onTaskSelect={onTaskSelect} onTaskDoubleClick={handleTaskDoubleClick} onTaskUpdate={onTaskUpdate}
          forcedEndDate={forcedEndDate}
          targetDate={targetNavigationDate}
          onNavigationComplete={handleNavigationComplete}
        />
      </div>
      <GanttStatusBar 
        viewMode={viewMode} tasksCount={tasks?.length || 0} 
        zoomLevel={zoomLevel} currentDate={currentDate} showToday={showToday} 
      />

      <GanttSettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <BaselineManagerDialog 
        isOpen={isBaselineManagerOpen} 
        onClose={() => setIsBaselineManagerOpen(false)} 
      />
      <TaskPropertiesDialog 
        taskId={editingTaskId} 
        isOpen={!!editingTaskId} 
        onClose={() => setEditingTaskId(null)} 
      />
      <GanttNavigationWarnings
        showEmptyDateWarning={showEmptyDateWarning}
        setShowEmptyDateWarning={setShowEmptyDateWarning}
        showLargeJumpWarning={showLargeJumpWarning}
        setShowLargeJumpWarning={setShowLargeJumpWarning}
        onConfirmEmptyDate={confirmEmptyDateNavigation}
        onConfirmLargeJump={confirmLargeJump}
      />
    </div>
  );
};

