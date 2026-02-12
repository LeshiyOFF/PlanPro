import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GanttCanvas } from './GanttCanvas'
import { ProfessionalGanttHandle } from './ProfessionalGantt'
import { Task } from '@/store/project/interfaces'
import { GanttToolbar } from './GanttToolbar'
import { GanttStatusBar } from './GanttStatusBar'
import { GanttSettingsDialog } from '@/components/dialogs/GanttSettingsDialog'
import { ProjectPropertiesDialog } from '@/components/dialogs/ProjectPropertiesDialog'
// GANTT-NAV-V2: GanttNavigationWarnings удалён - навигация ограничена через DatePicker
import { BaselineManagerDialog } from '../dialogs/BaselineManagerDialog'
import { TaskPropertiesDialog, type UpdateTaskWithConflictCheck } from '../dialogs/TaskPropertiesDialog'
import { useAppStore } from '@/store/appStore'
import { useProjectStore } from '@/store/projectStore'
import { cancelScheduledCriticalPathRecalc } from '@/store/criticalPathAutoRecalcScheduler'
import { useToast } from '@/hooks/use-toast'
import { IGanttCallbacks } from '@/types/gantt/IGanttTypes'
import { GanttDisplayMode } from '@/types/gantt/GanttTaskTypes'
import { useGanttState } from '@/hooks/gantt/useGanttState'
import { useGanttNavigation } from '@/hooks/gantt/useGanttNavigation'
import { getErrorMessage, type Throwable } from '@/utils/errorUtils'
import { CalendarDateService } from '@/services/CalendarDateService'

interface GanttCanvasControllerProps extends IGanttCallbacks {
  readonly tasks?: ReadonlyArray<Task>;
  readonly onSettingsClick?: () => void;
  readonly currentDate?: Date;
  readonly onCurrentDateChange?: (date: Date) => void;
  readonly mode?: GanttDisplayMode;
  readonly onModeChange?: (mode: GanttDisplayMode) => void;
  /** Ref для синхронизации вертикального скролла */
  readonly scrollRef?: React.RefObject<HTMLDivElement>;
  /** Callback при прокрутке для синхронизации */
  readonly onScroll?: () => void;
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
  scrollRef,
  onScroll,
}) => {
  // GANTT-SYNC: Вычисляем диапазон дат из задач для синхронизации viewport
  // GANTT-NAV-V3: Глубокий ключ для отслеживания изменений в датах задач
  // Это гарантирует обновление taskDateRange когда добавляется задача с новыми датами
  const tasksDateKey = useMemo(() => {
    if (tasks.length === 0) return 'empty'
    const sortedDates = tasks
      .map(t => `${new Date(t.startDate).getTime()}-${new Date(t.endDate).getTime()}`)
      .sort()
      .join('|')
    return `${tasks.length}:${sortedDates}`
  }, [tasks])

  const taskDateRange = useMemo(() => {
    if (tasks.length === 0) {
      const today = CalendarDateService.toLocalMidnight(new Date())
      return { minDate: today, maxDate: today }
    }
    const dates = tasks.map(t => CalendarDateService.toLocalMidnight(new Date(t.startDate)).getTime())
    const endDates = tasks.map(t => CalendarDateService.toLocalMidnight(new Date(t.endDate)).getTime())
    return {
      minDate: new Date(Math.min(...dates)),
      maxDate: new Date(Math.max(...endDates)),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksDateKey])

  // GANTT-NAV-V2: Диапазон навигации = диапазон задач с буфером
  // Вычисляется динамически при изменении задач
  const navigationRange = useMemo(() => {
    const bufferDays = 14 // 2 недели буфера по краям
    const minDate = new Date(taskDateRange.minDate)
    minDate.setDate(minDate.getDate() - bufferDays)
    const maxDate = new Date(taskDateRange.maxDate)
    maxDate.setDate(maxDate.getDate() + bufferDays)
    return { minDate, maxDate }
  }, [taskDateRange.minDate, taskDateRange.maxDate])

  // GANTT-SYNC: Начальная дата = внешний prop ИЛИ дата первой задачи (не "сегодня"!)
  const initialViewDate = useMemo(() => {
    if (propCurrentDate) return propCurrentDate
    return taskDateRange.minDate
  }, [propCurrentDate, taskDateRange.minDate])

  // GANTT-SYNC: Callback для получения актуальной minTaskDate при сбросе
  const getResetDate = useCallback(() => {
    return taskDateRange.minDate
  }, [taskDateRange.minDate])

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
  } = useGanttState({ initialDate: initialViewDate, getResetDate })

  // GANTT-NAV-V2: Синхронизация currentDate при инициализации
  const hasInitialized = useRef(false)
  useEffect(() => {
    // При первом рендере с задачами — устанавливаем дату на начало первой задачи
    if (!hasInitialized.current && tasks.length > 0) {
      hasInitialized.current = true
      const minTaskDate = taskDateRange.minDate
      // Если currentDate значительно отличается от диапазона задач — синхронизируем
      const currentTime = currentDate.getTime()
      const minTime = minTaskDate.getTime()
      const maxTime = taskDateRange.maxDate.getTime()
      
      // Если currentDate ДО начала задач или ПОСЛЕ конца — прижимаем к диапазону
      if (currentTime < minTime || currentTime > maxTime) {
        setCurrentDate(minTaskDate)
        onCurrentDateChange?.(minTaskDate)
      }
    }
  }, [tasks.length, taskDateRange, currentDate, setCurrentDate, onCurrentDateChange])
  
  // GANTT-NAV-V2: Отслеживаем изменение диапазона задач после инициализации
  // Если пользователь добавил задачу далеко в будущем - диапазон расширится автоматически
  const prevTaskDateRangeRef = useRef<{ minTime: number; maxTime: number } | null>(null)
  useEffect(() => {
    if (!hasInitialized.current) return
    
    const currentRange = {
      minTime: taskDateRange.minDate.getTime(),
      maxTime: taskDateRange.maxDate.getTime(),
    }
    
    // Если диапазон изменился — navigationRange обновится автоматически через useMemo
    // DatePicker получит новые fromDate/toDate и позволит выбирать новые даты
    if (prevTaskDateRangeRef.current) {
      const prevRange = prevTaskDateRangeRef.current
      const rangeChanged = 
        currentRange.minTime !== prevRange.minTime || 
        currentRange.maxTime !== prevRange.maxTime
        
      if (rangeChanged) {
        // Логируем для отладки (можно убрать в продакшене)
        console.debug('[GANTT-NAV-V2] Task range updated:', {
          prev: { min: new Date(prevRange.minTime), max: new Date(prevRange.maxTime) },
          curr: { min: taskDateRange.minDate, max: taskDateRange.maxDate },
        })
      }
    }
    
    prevTaskDateRangeRef.current = currentRange
  }, [taskDateRange.minDate, taskDateRange.maxDate])

  // GANTT-NAV-V2: Используем только необходимые части из useGanttNavigation
  const {
    forcedEndDate,
    targetNavigationDate,
    resetTargetDate,
    resetForcedEndDate,
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

  const { t } = useTranslation()
  const { toast } = useToast()
  const isPulseActive = useAppStore(state => state.ui.isPulseActive)
  const setPulseActive = useAppStore(state => (active: boolean) => state.setUIState({ isPulseActive: active }))
  const currentProjectId = useProjectStore(state => state.currentProjectId)
  const { recalculateCriticalPath } = useProjectStore()

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isProjectPropertiesOpen, setIsProjectPropertiesOpen] = React.useState(false)
  const [isBaselineManagerOpen, setIsBaselineManagerOpen] = React.useState(false)
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null)
  const [isCalculatingCriticalPath, setIsCalculatingCriticalPath] = React.useState(false)

  const ganttRef = useRef<ProfessionalGanttHandle>(null)

  const handleModeToggle = useCallback(() => {
    onModeChange?.(mode === 'standard' ? 'tracking' : 'standard')
  }, [mode, onModeChange])

  const handlePulseToggle = useCallback(async () => {
    if (isPulseActive) {
      cancelScheduledCriticalPathRecalc()
      setPulseActive(false)
      return
    }
    if (currentProjectId == null) {
      toast({
        variant: 'destructive',
        title: t('gantt.pulse_no_project_title', { defaultValue: 'Нет открытого проекта' }),
        description: t('gantt.pulse_no_project_desc', { defaultValue: 'Откройте или создайте проект для пересчёта критического пути.' }),
      })
      return
    }
    if (isCalculatingCriticalPath) return
    setIsCalculatingCriticalPath(true)
    try {
      await recalculateCriticalPath()
      setPulseActive(true)
    } catch (error) {
      console.error('[GanttCanvasController] Critical path calculation failed:', error)
      toast({
        variant: 'destructive',
        title: t('gantt.pulse_error_title', { defaultValue: 'Ошибка пересчёта критического пути' }),
        description: getErrorMessage(error as Throwable),
      })
    } finally {
      setIsCalculatingCriticalPath(false)
    }
  }, [isPulseActive, currentProjectId, isCalculatingCriticalPath, setPulseActive, recalculateCriticalPath, toast, t])

  const handleSaveBaseline = useCallback(() => {
    setIsBaselineManagerOpen(true)
  }, [])

  const handleTaskDoubleClickInternal = useCallback((task: Task) => {
    setEditingTaskId(task.id)
    onTaskDoubleClick?.(task)
  }, [onTaskDoubleClick])

  // GANTT-NAV-V2: Единая функция навигации - Single Source of Truth
  const navigateTo = useCallback((date: Date) => {
    // Ограничиваем дату диапазоном навигации
    const clampedTime = Math.max(
      navigationRange.minDate.getTime(),
      Math.min(date.getTime(), navigationRange.maxDate.getTime())
    )
    const clampedDate = new Date(clampedTime)
    
    // Обновляем состояние через общий механизм
    setCurrentDate(clampedDate)
    onCurrentDateChange?.(clampedDate)
    setShowToday(false)
  }, [navigationRange.minDate, navigationRange.maxDate, setCurrentDate, onCurrentDateChange, setShowToday])

  // GANTT-NAV-V2: Навигация стрелками
  const handleNavigate = useCallback((dir: 'left' | 'right') => {
    const stepDays = viewMode === 'day' ? 7 : viewMode === 'week' ? 14 : 30
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (dir === 'right' ? stepDays : -stepDays))
    navigateTo(newDate)
  }, [viewMode, currentDate, navigateTo])
  
  // GANTT-NAV-V2: Навигация через календарь (DatePicker)
  const handleCalendarDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return
    navigateTo(date)
  }, [navigateTo])
  
  // GANTT-NAV-V2: Проверка возможности навигации
  const canNavigateLeft = useMemo(() => {
    return currentDate.getTime() > navigationRange.minDate.getTime()
  }, [currentDate, navigationRange.minDate])
  
  const canNavigateRight = useMemo(() => {
    return currentDate.getTime() < navigationRange.maxDate.getTime()
  }, [currentDate, navigationRange.maxDate])

  const handleNavigationComplete = useCallback(() => {
    // GANTT-FIX: Сбрасываем targetNavigationDate после завершения навигации,
    // чтобы последующие стрелочные навигации (через viewDate) не конфликтовали
    // с устаревшим targetDate в effectiveViewDate (targetDate имеет наивысший приоритет)
    resetTargetDate()
  }, [resetTargetDate])

  return (
    <div className="gantt-controller flex flex-col h-full">
      <GanttToolbar
        tasksCount={tasks.length} viewMode={viewMode} onViewModeChange={handleViewModeChange}
        currentDate={currentDate} onDateSelect={handleCalendarDateSelect}
        onNavigateLeft={() => handleNavigate('left')} onNavigateRight={() => handleNavigate('right')}
        canNavigateLeft={canNavigateLeft} canNavigateRight={canNavigateRight}
        minDate={navigationRange.minDate} maxDate={navigationRange.maxDate}
        onZoomIn={handleZoomIn} onZoomOut={handleZoomOut}
        onFitToScreen={() => { handleFitToScreen(); resetForcedEndDate(); resetTargetDate() }}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSaveBaseline={handleSaveBaseline}
        // DISABLED: onProjectDeadlineClick — функция "Дедлайн проекта" временно отключена в интерфейсе
        // onProjectDeadlineClick={() => setIsProjectPropertiesOpen(true)}
        mode={mode}
        onModeToggle={handleModeToggle}
        isPulseActive={isPulseActive}
        onPulseToggle={handlePulseToggle}
        isCalculating={isCalculatingCriticalPath}
      />
      <div className="gantt-canvas-wrapper flex-1 h-0 min-w-0 bg-white relative">
        <GanttCanvas
          ref={ganttRef} tasks={tasks as Task[]} startDate={currentDate} zoomLevel={zoomLevel} mode={mode}
          onTaskSelect={onTaskSelect} onTaskDoubleClick={handleTaskDoubleClickInternal} onTaskUpdate={onTaskUpdate}
          forcedEndDate={forcedEndDate}
          targetDate={targetNavigationDate}
          onNavigationComplete={handleNavigationComplete}
          minDate={navigationRange.minDate}
          maxDate={navigationRange.maxDate}
          scrollRef={scrollRef}
          onScroll={onScroll}
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
      <ProjectPropertiesDialog
        isOpen={isProjectPropertiesOpen}
        onClose={() => setIsProjectPropertiesOpen(false)}
      />
      <BaselineManagerDialog
        isOpen={isBaselineManagerOpen}
        onClose={() => setIsBaselineManagerOpen(false)}
      />
      <TaskPropertiesDialog
        taskId={editingTaskId}
        isOpen={!!editingTaskId}
        onClose={() => setEditingTaskId(null)}
        updateTaskOverride={onTaskUpdate as UpdateTaskWithConflictCheck | undefined}
      />
    </div>
  )
}
