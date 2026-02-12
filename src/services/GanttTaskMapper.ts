import { Task, ProjectBaseline } from '@/store/project/interfaces'
import { Resource } from '@/types/resource-types'
import { Task as GanttTask, EmptyTask } from '@wamra/gantt-task-react'
import { CalendarDateService } from '@/services/CalendarDateService'
import { GanttDataExtender, TaskOrFiller } from '@/domain/canvas/services/GanttDataExtender'
import { IGanttPreferences } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces'
import { ColorUtils } from '@/utils/ColorUtils'
import { CalendarConflictService, CalendarConflictResult } from '@/domain/calendar/services/CalendarConflictService'
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar'

/**
 * GANTT-NAV: Расширенный интерфейс для задач Ганта
 * Включает originalTask для обратной связи с доменной моделью
 */
export interface ExtendedGanttTask extends GanttTask {
  originalTask: Task & { isFiller?: boolean };
  baselineDates?: { startDate: Date; endDate: Date };
  calendarConflict?: CalendarConflictResult;
}

/**
 * GANTT-NAV: Расширенный EmptyTask для filler-задач
 * Используется для заполнения вертикального пространства без визуального рендеринга
 */
export interface ExtendedEmptyTask extends EmptyTask {
  originalTask: { isFiller: true };
}

/** Тип объединения для результата маппинга */
export type MappedGanttTask = ExtendedGanttTask | ExtendedEmptyTask;

/**
 * GanttTaskMapper - Сервис для преобразования доменных задач в задачи библиотеки Ганта.
 */
export class GanttTaskMapper {
  private static dataExtender = new GanttDataExtender()

  public static mapToGanttTasks(
    tasks: Task[],
    containerHeight: number,
    _projectRange: { start: Date; end: Date; tasksEnd: Date },
    getVisualProgress: (t: Task) => number,
    getFormattedName: (t: Task) => string,
    showBaseline: boolean,
    mode: string,
    preferences: IGanttPreferences,
    isPulseActive: boolean,
    resources: Resource[] = [],
    calendars: IWorkCalendar[] = [],
    activeBaseline?: ProjectBaseline,
    t?: (key: string, opts?: Record<string, string>) => string,
  ): MappedGanttTask[] {
    const extendedTasks = this.dataExtender.extendTasksToFillView(tasks, containerHeight, preferences.rowHeight)
    const conflictService = CalendarConflictService.getInstance()

    const mappedTasks: MappedGanttTask[] = extendedTasks.map((task: TaskOrFiller): MappedGanttTask => {
      // GANTT-NAV: Для filler-задач возвращаем нативный EmptyTask
      // EmptyTask не рендерится библиотекой @wamra/gantt-task-react, что обеспечивает
      // чистое заполнение вертикального пространства без visual overhead
      if ('isFiller' in task && task.isFiller) {
        return {
          id: task.id,
          name: '', // EmptyTask требует имя, но оно не отображается
          type: 'empty',
          isDisabled: true,
          originalTask: { isFiller: true },
        } as ExtendedEmptyTask
      }

      // Type guard: после проверки isFiller, task это Task
      const realTask = task as Task

      const visualProgress = getVisualProgress(realTask)
      const isCritical = !!realTask.isCritical
      const baselineDates = activeBaseline?.taskDates[realTask.id]

      // Stage 8.20: Проверка календарных конфликтов
      const calendarConflict = conflictService.checkTaskConflict(realTask, resources, calendars)

      const styles = this.calculateStyles(realTask, isCritical, isPulseActive, showBaseline, mode, preferences, baselineDates, calendarConflict)

      const mappedStart = CalendarDateService.toLocalMidnight(realTask.startDate)
      const mappedEnd = CalendarDateService.toLocalEndOfDay(realTask.endDate)

      // GANTT-DATE-DEBUG: Диагностика преобразования дат для выявления проблемы "задача на 1 день короче"
      console.log(`[GANTT-DATE-DEBUG] Task "${realTask.name}" (ID: ${realTask.id}):`, {
        originalStartDate: realTask.startDate.toISOString(),
        originalEndDate: realTask.endDate.toISOString(),
        mappedStart: {
          iso: mappedStart.toISOString(),
          local: `${mappedStart.getFullYear()}-${String(mappedStart.getMonth() + 1).padStart(2, '0')}-${String(mappedStart.getDate()).padStart(2, '0')} ${String(mappedStart.getHours()).padStart(2, '0')}:${String(mappedStart.getMinutes()).padStart(2, '0')}:${String(mappedStart.getSeconds()).padStart(2, '0')}.${String(mappedStart.getMilliseconds()).padStart(3, '0')}`,
        },
        mappedEnd: {
          iso: mappedEnd.toISOString(),
          local: `${mappedEnd.getFullYear()}-${String(mappedEnd.getMonth() + 1).padStart(2, '0')}-${String(mappedEnd.getDate()).padStart(2, '0')} ${String(mappedEnd.getHours()).padStart(2, '0')}:${String(mappedEnd.getMinutes()).padStart(2, '0')}:${String(mappedEnd.getSeconds()).padStart(2, '0')}.${String(mappedEnd.getMilliseconds()).padStart(3, '0')}`,
        },
        verification: {
          startIsAtMidnight: mappedStart.getHours() === 0 && mappedStart.getMinutes() === 0,
          endIsAtEndOfDay: mappedEnd.getHours() === 23 && mappedEnd.getMinutes() === 59 && mappedEnd.getSeconds() === 59,
        },
      })

      return {
        id: realTask.id,
        name: this.calculateLabel(realTask, preferences, getFormattedName, resources, baselineDates, t),
        start: mappedStart,
        end: mappedEnd,
        // Округление для устранения IEEE 754 артефактов (0.28 * 100 -> 28, не 28.000000...)
        progress: Math.round(visualProgress * 100),
        type: realTask.isSummary ? 'project' : (realTask.isMilestone ? 'milestone' : 'task'),
        dependencies: (realTask.predecessors || []).map(predId => ({
          sourceId: predId,
          sourceTarget: 'endOfTask' as const,
          ownTarget: 'startOfTask' as const,
        })),
        styles,
        isDisabled: !!realTask.isSummary,
        // GANTT-UI: Отключение кружочков для создания связей (relation handles)
        isRelationDisabled: true,
        originalTask: realTask,
        baselineDates,
        calendarConflict,
      } as ExtendedGanttTask
    })

    return mappedTasks
  }

  private static calculateStyles(
    task: Task & { isFiller?: boolean },
    isCritical: boolean,
    isPulseActive: boolean,
    _showBaseline: boolean,
    _mode: string,
    prefs: IGanttPreferences,
    _baselineDates?: { startDate: Date; endDate: Date },
    calendarConflict?: CalendarConflictResult,
  ) {
    // GANTT-COLORS-FIX: Filler-задачи полностью прозрачны
    // Возвращаем напрямую без buildColorStyles, чтобы избежать darken('transparent')
    if (task.isFiller) {
      return {
        barBackgroundColor: 'transparent',
        barBackgroundSelectedColor: 'transparent',
        barProgressColor: 'transparent',
        barProgressSelectedColor: 'transparent',
      }
    }

    let barColor: string | undefined = undefined

    // HYBRID-CPM: Dependency violation warning (amber/yellow, high priority)
    // GANTT-COLORS-FIX: Используем buildColorStyles для правильных имён полей
    if (task.dependencyViolation && isPulseActive) {
      return this.buildColorStyles('#fbbf24', task.isSummary, task.isMilestone) // Amber-400
    }

    // Stage 8.20: Calendar conflict warning (keeps original color but with potential outline)
    // GANTT-COLORS-FIX: Используем buildColorStyles для правильных имён полей
    if (calendarConflict?.hasConflict && !isPulseActive) {
      const baseColor = barColor || prefs.accentColor
      return this.buildColorStyles(baseColor, task.isSummary, task.isMilestone)
    }

    // Pulse Mode (Critical Path) has highest priority
    // GANTT-COLORS-FIX: Используем buildColorStyles для правильных имён полей
    if (isPulseActive && isCritical) {
      return this.buildColorStyles('#ef4444', task.isSummary, task.isMilestone) // Red-500
    }

    // VB.11: Подсветка задач с отрицательным slack (просрочка) оранжевым цветом
    // GANTT-COLORS-FIX: Используем buildColorStyles для правильных имён полей
    const hasNegativeSlack = task.totalSlack !== undefined && task.totalSlack < 0
    if (isPulseActive && prefs.showNegativeSlack && hasNegativeSlack && !isCritical) {
      return this.buildColorStyles('#f97316', task.isSummary, task.isMilestone) // Orange-500
    }

    // GANTT-COLORS-FIX: Default Coloring based on preferences
    // ВАЖНО: Критические задачи красные ТОЛЬКО при активном пульсе!
    // Без пульса они используют обычную раскраску из настроек
    if (task.isSummary) {
      barColor = prefs.summaryColoringMode === 'auto'
        ? ColorUtils.generateRainbowColor(task.id)
        : prefs.summaryColor
    } else {
      // Выбор цвета по режиму раскраски (без учёта isCritical — это только для пульса)
      switch (prefs.coloringMode) {
        case 'rainbow':
          barColor = ColorUtils.generateRainbowColor(task.id)
          break
        case 'status':
          barColor = this.getColorByStatus(task)
          break
        case 'single':
        default:
          barColor = prefs.accentColor
          break
      }
    }

    // GANTT-COLORS-FIX: Возвращаем стили для соответствующего типа задачи
    return this.buildColorStyles(barColor, task.isSummary, task.isMilestone)
  }

  /**
   * GANTT-COLORS-FIX: Создаёт объект стилей с правильными именами полей
   * Библиотека использует разные префиксы для разных типов задач:
   * - bar* для обычных задач
   * - project* для суммарных задач (type='project')
   * - milestone* для вех
   */
  private static buildColorStyles(
    baseColor: string,
    isSummary: boolean = false,
    isMilestone: boolean = false,
  ): Record<string, string> {
    const bg = baseColor
    const bgSelected = ColorUtils.darken(baseColor, 0.15)
    const progress = ColorUtils.darken(baseColor, 0.25)
    const progressSelected = ColorUtils.darken(baseColor, 0.35)

    if (isSummary) {
      return {
        projectBackgroundColor: bg,
        projectBackgroundSelectedColor: bgSelected,
        projectProgressColor: progress,
        projectProgressSelectedColor: progressSelected,
      }
    }

    if (isMilestone) {
      return {
        milestoneBackgroundColor: bg,
        milestoneBackgroundSelectedColor: bgSelected,
      }
    }

    return {
      barBackgroundColor: bg,
      barBackgroundSelectedColor: bgSelected,
      barProgressColor: progress,
      barProgressSelectedColor: progressSelected,
    }
  }

  /**
   * GANTT-COLORS: Улучшенная палитра статусов
   * Отражает прогресс выполнения задачи через цвет
   */
  private static getColorByStatus(task: Task): string {
    if (task.progress >= 1) return '#10b981' // Emerald-500 (завершено)
    if (task.progress >= 0.5) return '#3b82f6' // Blue-500 (в процессе)
    if (task.progress > 0) return '#f59e0b' // Amber-500 (начато)
    return '#94a3b8' // Slate-400 (не начато)
  }

  private static calculateLabel(
    task: Task & { isFiller?: boolean },
    prefs: IGanttPreferences,
    getFormattedName: (t: Task) => string,
    resources: Resource[],
    baselineDates?: { startDate: Date; endDate: Date },
    t?: (key: string, opts?: Record<string, string>) => string,
  ): string {
    if (task.isFiller) return ''
    if (prefs.labelMode === 'none') return ''

    const baseName = getFormattedName(task)
    let label = baseName

    // Delta Markers
    if (prefs.showDeltasInLabels && baselineDates && !task.isSummary && !task.isMilestone) {
      const diffDays = Math.round((new Date(task.endDate).getTime() - new Date(baselineDates.endDate).getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays > 0) {
        label += ` [+${diffDays}${t ? t('gantt.days_short', { defaultValue: 'д' }) : 'd'}]`
      } else if (diffDays < 0) {
        label += ` [${diffDays}${t ? t('gantt.days_short', { defaultValue: 'д' }) : 'd'}]`
      } else {
        label += ` [${t ? t('gantt.on_track', { defaultValue: 'ОК' }) : 'OK'}]`
      }
    }

    switch (prefs.labelMode) {
      case 'resource': {
        const resourceIds = task.resourceAssignments?.map((a: { resourceId: string }) => a.resourceId) ?? []
        const names = resourceIds
          .map((id: string) => resources.find((r: Resource) => r.id === id)?.name)
          .filter((name: string | undefined): name is string => !!name && name.trim() !== '')
        return names.length > 0 ? `${label} [${names.join(', ')}]` : label
      }
      case 'dates':
        return `${label} (${task.startDate.toLocaleDateString()} - ${task.endDate.toLocaleDateString()})`
      default:
        return label
    }
  }
}
