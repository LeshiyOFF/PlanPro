import { ResourceAssignment } from '@/store/project/interfaces'

/**
 * Представление данных использования задачи
 *
 * Расширенная версия с поддержкой иерархии, вех и суммарных задач
 */
export interface ITaskUsage {
  id: string;
  taskName: string;
  startDate: Date | string;
  endDate: Date | string;
  /** Длительность в числовом формате (для расчётов и форматирования в колонке) */
  duration: number;
  percentComplete: number;
  /** Отформатированная строка ресурсов для отображения */
  resources: string;
  /** Назначения ресурсов с указанием процента загрузки */
  resourceAssignments: ResourceAssignment[];
  /** Уровень вложенности задачи (1 = корневая) */
  level: number;
  /** Является ли задача вехой */
  milestone: boolean;
  /** Является ли задача суммарной (родительской) */
  summary: boolean;
}


