import { useMemo } from 'react';
import { Resource } from '@/types/resource-types';
import { Task, getTaskResourceIds } from '@/store/project/interfaces';

/** Базовая загрузка: 100% = полная занятость ресурса */
const BASE_CAPACITY = 1.0;

/**
 * Интерфейс статистики использования ресурсов.
 * Категории взаимоисключающие: каждый ресурс попадает только в одну.
 */
export interface ResourceUsageStats {
  /** Количество доступных ресурсов (загрузка = 0%, нет назначений) */
  available: number;
  /** Количество занятых ресурсов (0% < загрузка <= 100%) */
  busy: number;
  /** Количество перегруженных ресурсов (загрузка > 100%) */
  overloaded: number;
}

/**
 * Вычисляет суммарный процент загрузки ресурса из всех назначений.
 * Учитывает maxUnits ресурса для определения реальной перегрузки.
 * 
 * @param resource Ресурс для расчёта
 * @param tasks Массив задач проекта
 * @returns Загрузка относительно maxUnits (1.0 = 100% от возможностей)
 */
const calculateResourceLoad = (resource: Resource, tasks: Task[]): number => {
  let totalUnits = 0;
  
  for (const task of tasks) {
    // Пропускаем summary задачи
    if (task.isSummary) continue;
    
    // Приоритет: новый формат resourceAssignments
    const assignment = task.resourceAssignments?.find(a => a.resourceId === String(resource.id));
    if (assignment) {
      totalUnits += assignment.units;
    } else if (getTaskResourceIds(task).includes(String(resource.id))) {
      // Fallback: старый формат resourceIds (100% по умолчанию)
      totalUnits += BASE_CAPACITY;
    }
  }
  
  // Нормализуем по maxUnits ресурса
  // Если maxUnits = 2 (200%), то загрузка 1.0 на самом деле 50% от возможностей
  const maxUnits = resource.maxUnits || BASE_CAPACITY;
  return totalUnits / maxUnits;
};

/**
 * Хук для вычисления статистики использования ресурсов.
 * 
 * Категории взаимоисключающие:
 * - Available: ресурс не назначен ни на одну задачу (loadPercent === 0)
 * - Busy: ресурс назначен, но не перегружен (0 < loadPercent <= 1)
 * - Overloaded: ресурс перегружен (loadPercent > 1)
 * 
 * @version 2.0 - Исправлена логика: категории теперь взаимоисключающие
 */
export const useResourceUsageStats = (
  resources: Resource[],
  tasks: Task[]
): ResourceUsageStats => {
  return useMemo(() => {
    let available = 0;
    let busy = 0;
    let overloaded = 0;
    
    resources.forEach(resource => {
      const loadPercent = calculateResourceLoad(resource, tasks);
      
      // Взаимоисключающая логика
      if (loadPercent > BASE_CAPACITY) {
        // Перегружен: загрузка превышает 100% от maxUnits
        overloaded++;
      } else if (loadPercent > 0) {
        // Занят: есть назначения, но не перегружен
        busy++;
      } else {
        // Доступен: нет назначений
        available++;
      }
    });
    
    return { available, busy, overloaded };
  }, [resources, tasks]);
};
