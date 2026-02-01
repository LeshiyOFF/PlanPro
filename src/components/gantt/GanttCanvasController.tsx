import React, { useCallback, useRef } from 'react'
import { GanttCanvas } from './GanttCanvas'
import { ProfessionalGanttHandle } from './ProfessionalGantt'
import { GanttNavigationService } from '@/services/GanttNavigationService'
import { Task } from '@/store/project/interfaces'
import { GanttToolbar } from './GanttToolbar'
import { GanttStatusBar } from './GanttStatusBar'
import { GanttSettingsDialog } from '@/components/dialogs/GanttSettingsDialog'
import { GanttNavigationWarnings } from './GanttNavigationWarnings'
import { BaselineManagerDialog } from '../dialogs/BaselineManagerDialog'
import { TaskPropertiesDialog } from '../dialogs/TaskPropertiesDialog'
import { useAppStore } from '@/store/appStore'
import { useProjectStore } from '@/store/projectStore'
import { IGanttCallbacks } from '@/types/gantt/IGanttTypes'
import { GanttDisplayMode } from '@/types/gantt/GanttTaskTypes'
import { useGanttState } from '@/hooks/gantt/useGanttState'
import { useGanttNavigation } from '@/hooks/gantt/useGanttNavigation'

interface GanttCanvasControllerProps extends IGanttCallbacks {
  readonly tasks?: ReadonlyArray<Task>;
  readonly onSettingsClick?: () => void;
  readonly currentDate?: Date;
  readonly onCurrentDateChange?: (date: Date) => void;
  readonly mode?: GanttDisplayMode;
  readonly onModeChange?: (mode: GanttDisplayMode) => void;
}

export const GanttCanvasController: React.FC<GanttCanvasControllerProps> = ({
  tasks = [],
  onTaskSelect,
  onTaskDoubleClick,
  onTaskUpdate,
  currentDate: propCurrentDate,
  onCurrentDateChange,
  mode = 'standard',
  onModeChange,
}) => {
  const {
    viewMode,
    showToday,
    zoomLevel,
    currentDate,
    setViewMode,
    setShowToday,
    setZoomLevel,
    setCurrentDate,
    handleViewModeChange,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
  } = useGanttState({ initialDate: propCurrentDate })

  const {
    forcedEndDate,
    targetNavigationDate,
    showEmptyDateWarning,
    showLargeJumpWarning,
    handleDateSelect,
    confirmLargeJump,
    confirmEmptyDateNavigation,
    setShowEmptyDateWarning,
    setShowLargeJumpWarning,
  } = useGanttNavigation({
    tasks: tasks as Task[],
    viewMode,
    onDateChange: (date) => {
      setCurrentDate(date)
      onCurrentDateChange?.(date)
      setShowToday(false)
    },
    onViewModeChange: setViewMode,
    onZoomChange: setZoomLevel,
  })

  const isPulseActive = useAppStore(state => state.ui.isPulseActive)
  const setPulseActive = useAppStore(state => (active: boolean) => state.setUIState({ isPulseActive: active }))
  const { recalculateCriticalPath } = useProjectStore()

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isBaselineManagerOpen, setIsBaselineManagerOpen] = React.useState(false)
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null)
  const [isCalculatingCriticalPath, setIsCalculatingCriticalPath] = React.useState(false)

  const ganttRef = useRef<ProfessionalGanttHandle>(null)

  const handleModeToggle = useCallback(() => {
    onModeChange?.(mode === 'standard' ? 'tracking' : 'standard')
  }, [mode, onModeChange])

  const handlePulseToggle = useCallback(async () => {
    if (!isPulseActive) {
      setIsCalculatingCriticalPath(true)
      try {
        await recalculateCriticalPath()
      } catch (error) {
        console.error('[GanttCanvasController] Critical path calculation failed:', error)
      } finally {
        setIsCalculatingCriticalPath(false)
      }
    }
    setPulseActive(!isPulseActive)
  }, [isPulseActive, setPulseActive, recalculateCriticalPath])

  const handleSaveBaseline = useCallback(() => {
    setIsBaselineManagerOpen(true)
  }, [])

  const handleTaskDoubleClickInternal = useCallback((task: Task) => {
    setEditingTaskId(task.id)
    onTaskDoubleClick?.(task)
  }, [onTaskDoubleClick])

  const handleNavigate = useCallback((dir: 'left' | 'right') => {
    const current = ganttRef.current?.getCurrentScroll() || 0
    const next = GanttNavigationService.calculateNextScroll(dir, current, zoomLevel * 300)
    ganttRef.current?.scrollToPosition(next)
    setShowToday(false)
  }, [zoomLevel, setShowToday])

  const handleNavigationComplete = useCallback(() => {
    // Навигация завершена
  }, [])

  return (
    <div className="gantt-controller flex flex-col h-full">
      <GanttToolbar
        tasksCount={tasks.length} viewMode={viewMode} onViewModeChange={handleViewModeChange}
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
          ref={ganttRef} tasks={tasks as Task[]} startDate={currentDate} zoomLevel={zoomLevel} mode={mode}
          onTaskSelect={onTaskSelect} onTaskDoubleClick={handleTaskDoubleClickInternal} onTaskUpdate={onTaskUpdate}
          forcedEndDate={forcedEndDate}
          targetDate={targetNavigationDate}
          onNavigationComplete={handleNavigationComplete}
        />
      </div>
      <GanttStatusBar
        viewMode={viewMode} tasksCount={tasks.length}
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
  )
}
