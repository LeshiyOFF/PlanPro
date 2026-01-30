import { INITIAL_TASKS } from '../../data/projectData';
import { Resource } from '@/types/resource-types';
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService';

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
    calendarId: 'standard'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    type: 'Work',
    maxUnits: 0.75,
    standardRate: 45,
    overtimeRate: 65,
    costPerUse: 0,
    available: true,
    calendarId: 'standard'
  },
  {
    id: '3',
    name: 'Development Team',
    type: 'Material',
    maxUnits: 10,
    standardRate: 0,
    overtimeRate: 0,
    costPerUse: 0,
    available: true,
    materialLabel: 'чел.'
  }
];

/**
 * Начальное состояние с демо-данными для первого запуска
 */
export const initialProjectState = {
  tasks: INITIAL_TASKS,
  resources: initialResources,
  calendars: CalendarTemplateService.getInstance().getBaseCalendars(),
  baselines: [],
  activeBaselineId: undefined as string | undefined,
  initialized: true,
  currentProjectId: undefined as number | undefined,
  currentFilePath: undefined as string | undefined,
  projectManager: undefined as string | undefined,
  isDirty: false
};

/**
 * Пустое состояние для нового/загруженного проекта
 */
export const emptyProjectState = {
  tasks: [],
  resources: [],
  calendars: CalendarTemplateService.getInstance().getBaseCalendars(),
  baselines: [],
  activeBaselineId: undefined as string | undefined,
  initialized: true,
  currentProjectId: undefined as number | undefined,
  currentFilePath: undefined as string | undefined,
  projectManager: undefined as string | undefined,
  isDirty: false
};

