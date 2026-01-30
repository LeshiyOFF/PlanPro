import { Task, ProjectBaseline } from '@/store/project/interfaces';
import { Resource } from '@/types/resource-types';
import { Task as GanttTask } from 'gantt-task-react';
import { CalendarDateService } from '@/services/CalendarDateService';
import { GanttDataExtender } from '@/domain/canvas/services/GanttDataExtender';
import { IGanttPreferences } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces';
import { ColorUtils } from '@/utils/ColorUtils';
import { CalendarConflictService, CalendarConflictResult } from '@/domain/calendar/services/CalendarConflictService';
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';

export interface ExtendedGanttTask extends GanttTask {
  originalTask: Task & { isFiller?: boolean };
  baselineDates?: { startDate: Date; endDate: Date };
  calendarConflict?: CalendarConflictResult;
}

/**
 * GanttTaskMapper - Сервис для преобразования доменных задач в задачи библиотеки Ганта.
 */
export class GanttTaskMapper {
  private static dataExtender = new GanttDataExtender();

  public static mapToGanttTasks(
    tasks: Task[], 
    containerHeight: number, 
    projectRange: { start: Date; end: Date; tasksEnd: Date },
    getVisualProgress: (t: Task) => number,
    getFormattedName: (t: Task) => string,
    showBaseline: boolean,
    mode: string,
    preferences: IGanttPreferences,
    isPulseActive: boolean,
    resources: Resource[] = [],
    calendars: IWorkCalendar[] = [],
    activeBaseline?: ProjectBaseline,
    t?: any
  ): ExtendedGanttTask[] {
    const extendedTasks = this.dataExtender.extendTasksToFillView(tasks, containerHeight, preferences.rowHeight);
    const conflictService = CalendarConflictService.getInstance();
    
    return extendedTasks.map((task: Task & { isFiller?: boolean }): ExtendedGanttTask => {
      const visualProgress = task.isFiller ? 0 : getVisualProgress(task);
      const isCritical = !task.isFiller && (task.critical || task.criticalPath);
      const baselineDates = activeBaseline?.taskDates[task.id];
      
      // Stage 8.20: Проверка календарных конфликтов
      const calendarConflict = task.isFiller ? undefined : conflictService.checkTaskConflict(task, resources, calendars);
      
      const styles = this.calculateStyles(task, isCritical, isPulseActive, showBaseline, mode, preferences, baselineDates, calendarConflict);

      const mappedStart = task.isFiller ? projectRange.start : CalendarDateService.toLocalMidnight(task.startDate);
      const mappedEnd = task.isFiller ? projectRange.tasksEnd : CalendarDateService.toLocalEndOfDay(task.endDate);
      
      return {
        id: task.id,
        name: this.calculateLabel(task, preferences, getFormattedName, resources, baselineDates, t),
        start: mappedStart,
        end: mappedEnd,
        // Округление для устранения IEEE 754 артефактов (0.28 * 100 -> 28, не 28.000000...)
        progress: Math.round(visualProgress * 100),
        type: task.summary ? 'project' : (task.milestone ? 'milestone' : 'task'),
        dependencies: task.predecessors || [],
        styles,
        isDisabled: !!task.isFiller || !!task.summary,
        originalTask: task,
        baselineDates,
        calendarConflict
      };
    });
  }

  private static calculateStyles(
    task: Task & { isFiller?: boolean }, 
    isCritical: boolean, 
    isPulseActive: boolean,
    showBaseline: boolean,
    mode: string,
    prefs: IGanttPreferences,
    baselineDates?: { startDate: Date; endDate: Date },
    calendarConflict?: CalendarConflictResult
  ) {
    if (task.isFiller) {
      return {
        backgroundColor: 'transparent',
        backgroundSelectedColor: 'transparent',
        progressColor: 'transparent',
        progressSelectedColor: 'transparent'
      };
    }

    let barColor = task.color;
    let backgroundSelectedColor = '#3b82f6';
    let progressColor = '#2563eb';
    
    // Stage 8.20: Calendar conflict warning (orange outline, highest priority after pulse)
    if (calendarConflict?.hasConflict && !isPulseActive) {
      return {
        backgroundColor: barColor || prefs.accentColor,
        backgroundSelectedColor: '#fb923c',
        progressColor: '#ea580c',
        progressSelectedColor: '#c2410c',
        // Оранжевая рамка с легким свечением для привлечения внимания
        filter: 'drop-shadow(0 0 3px rgba(251, 146, 60, 0.5))'
      };
    }
    
    // Pulse Mode (Critical Path) has highest priority
    if (isPulseActive && isCritical) {
      barColor = '#ef4444';
      backgroundSelectedColor = '#dc2626';
      progressColor = '#b91c1c';
      
      return {
        backgroundColor: barColor,
        backgroundSelectedColor,
        progressColor,
        progressSelectedColor: '#991b1b',
        // Добавляем эффект свечения для критических задач
        filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))'
      };
    }

    // Default Coloring based on preferences
    const overrideColor = (task.summary && prefs.summaryColoringMode === 'auto') || 
                         (!task.summary && prefs.coloringMode !== 'single');

    if (!barColor || overrideColor) {
      if (task.summary) {
        barColor = prefs.summaryColoringMode === 'auto' 
          ? ColorUtils.generateRainbowColor(task.id) 
          : prefs.summaryColor;
      } else {
        barColor = prefs.coloringMode === 'rainbow' 
          ? ColorUtils.generateRainbowColor(task.id) 
          : (isCritical ? '#ef4444' : (prefs.coloringMode === 'status' ? this.getColorByStatus(task) : prefs.accentColor));
      }
    }

    return {
      backgroundColor: barColor,
      backgroundSelectedColor: ColorUtils.isDark(barColor) ? '#2563eb' : '#3b82f6',
      progressColor: ColorUtils.isDark(barColor) ? '#1d4ed8' : '#2563eb',
      progressSelectedColor: '#1e40af'
    };
  }

  private static getColorByStatus(task: Task): string {
    if (task.progress >= 1) return '#22c55e'; // Green
    if (task.progress > 0) return '#3b82f6'; // Blue
    return '#94a3b8'; // Slate
  }

  private static calculateLabel(
    task: Task & { isFiller?: boolean }, 
    prefs: IGanttPreferences, 
    getFormattedName: (t: Task) => string,
    resources: Resource[],
    baselineDates?: { startDate: Date; endDate: Date },
    t?: any // Translation function
  ): string {
    if (task.isFiller) return '';
    if (prefs.labelMode === 'none') return '';
    
    const baseName = getFormattedName(task);
    let label = baseName;

    // Delta Markers
    if (prefs.showDeltasInLabels && baselineDates && !task.summary && !task.milestone) {
      const diffDays = Math.round((new Date(task.endDate).getTime() - new Date(baselineDates.endDate).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        label += ` [+${diffDays}${t ? t('gantt.days_short', { defaultValue: 'д' }) : 'd'}]`;
      } else if (diffDays < 0) {
        label += ` [${diffDays}${t ? t('gantt.days_short', { defaultValue: 'д' }) : 'd'}]`;
      } else {
        label += ` [${t ? t('gantt.on_track', { defaultValue: 'ОК' }) : 'OK'}]`;
      }
    }

    switch (prefs.labelMode) {
      case 'resource': {
        const names = task.resourceIds
          ?.map(id => resources.find(r => r.id === id)?.name)
          .filter((name): name is string => !!name && name.trim() !== '') || [];
        return names.length > 0 ? `${label} [${names.join(', ')}]` : label;
      }
      case 'dates':
        return `${label} (${task.startDate.toLocaleDateString()} - ${task.endDate.toLocaleDateString()})`;
      default:
        return label;
    }
  }
}
