import { INITIAL_TASKS } from '../../data/projectData';
import { Resource } from '@/types/resource-types';

export const initialResources: Resource[] = [
  {
    id: '1',
    name: 'John Smith',
    type: 'Work',
    maxUnits: 1,
    standardRate: 50,
    overtimeRate: 75,
    costPerUse: 0,
    available: true
  },
  {
    id: '2',
    name: 'Maria Garcia',
    type: 'Work',
    maxUnits: 0.75,
    standardRate: 45,
    overtimeRate: 65,
    costPerUse: 0,
    available: true
  },
  {
    id: '3',
    name: 'Development Team',
    type: 'Material',
    maxUnits: 10,
    standardRate: 0,
    overtimeRate: 0,
    costPerUse: 0,
    available: true
  }
];

/**
 * Начальное состояние с демо-данными для первого запуска
 */
export const initialProjectState = {
  tasks: INITIAL_TASKS,
  resources: initialResources,
  initialized: true,
  currentProjectId: undefined as number | undefined,
  currentFilePath: undefined as string | undefined,
  isDirty: false
};

/**
 * Пустое состояние для нового/загруженного проекта
 */
export const emptyProjectState = {
  tasks: [],
  resources: [],
  initialized: true,
  currentProjectId: undefined as number | undefined,
  currentFilePath: undefined as string | undefined,
  isDirty: false
};
