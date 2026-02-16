import { INITIAL_TASKS } from '../../data/projectData'
import { Resource } from '@/types/resource-types'
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService'
import { ProjectStore, Task } from './interfaces'

export const initialResources: Resource[] = [
  {
    id: '1',
    name: 'John Smith',
    type: 'Work',
    maxUnits: 1,
    standardRate: 50,
    overtimeRate: 75,
    costPerUse: 0,
    available: true,
    calendarId: 'standard',
  },
]

/**
 * Начальное состояние с демо-данными для первого запуска
 */
export const initialProjectState: Omit<ProjectStore, 'setTasks' | 'setProjectInfo' | 'setProjectManager' | 'setImposedFinishDate' | 'updateTask' | 'addTask' | 'deleteTask' | 'moveTask' | 'setResources' | 'updateResource' | 'addResource' | 'deleteResource' | 'setCalendars' | 'addCalendar' | 'updateCalendar' | 'deleteCalendar' | 'getCalendar' | 'indentTask' | 'outdentTask' | 'linkTasks' | 'unlinkTasks' | 'toggleMilestone' | 'isValidPredecessor' | 'recalculateAllTasks' | 'setInitialized' | 'reset' | 'getHoursPerDay' | 'splitTask' | 'mergeTask' | 'recalculateCriticalPath' | 'saveBaseline' | 'deleteBaseline' | 'setActiveBaseline' | 'setDirty' | 'markClean'> = {
  tasks: INITIAL_TASKS as Task[],
  resources: initialResources,
  calendars: CalendarTemplateService.getInstance().getBaseCalendars(),
  baselines: [],
  activeBaselineId: undefined,
  initialized: true,
  currentProjectId: undefined,
  currentFilePath: undefined,
  projectManager: undefined,
  imposedFinishDate: null,
  isForward: true, // VB.12: По умолчанию Schedule from Start
  isDirty: false,
}

/**
 * Пустое состояние для нового/загруженного проекта
 */
export const emptyProjectState: Omit<ProjectStore, 'setTasks' | 'setProjectInfo' | 'setProjectManager' | 'setImposedFinishDate' | 'updateTask' | 'addTask' | 'deleteTask' | 'moveTask' | 'setResources' | 'updateResource' | 'addResource' | 'deleteResource' | 'setCalendars' | 'addCalendar' | 'updateCalendar' | 'deleteCalendar' | 'getCalendar' | 'indentTask' | 'outdentTask' | 'linkTasks' | 'unlinkTasks' | 'toggleMilestone' | 'isValidPredecessor' | 'recalculateAllTasks' | 'setInitialized' | 'reset' | 'getHoursPerDay' | 'splitTask' | 'mergeTask' | 'recalculateCriticalPath' | 'saveBaseline' | 'deleteBaseline' | 'setActiveBaseline' | 'setDirty' | 'markClean'> = {
  tasks: [],
  resources: [],
  calendars: CalendarTemplateService.getInstance().getBaseCalendars(),
  baselines: [],
  activeBaselineId: undefined,
  initialized: true,
  currentProjectId: undefined,
  currentFilePath: undefined,
  projectManager: undefined,
  imposedFinishDate: null,
  isForward: true, // VB.12: По умолчанию Schedule from Start
  isDirty: false,
}

