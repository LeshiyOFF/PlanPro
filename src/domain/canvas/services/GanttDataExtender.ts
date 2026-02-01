import { Task } from '@/store/project/interfaces';

/** Задача-филлер для заполнения пустого пространства Ганта */
export interface GanttFillerTask extends Partial<Task> {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  type: string;
  level: number;
  isDisabled?: boolean;
  isFiller?: boolean;
}

export type TaskOrFiller = Task | GanttFillerTask;

/**
 * GanttDataExtender - Сервис для подготовки визуальных данных Ганта.
 * Позволяет заполнить пустое пространство диаграммы фиктивными строками и расширить временную шкалу.
 */
export class GanttDataExtender {
  /**
   * Добавляет фиктивные задачи для заполнения вертикального пространства.
   *
   * @param realTasks - Массив реальных задач проекта
   * @param containerHeight - Текущая высота контейнера Ганта
   * @param rowHeight - Высота одной строки
   * @returns Массив задач, дополненный фиктивными строками
   */
  public extendTasksToFillView(
    realTasks: Task[],
    containerHeight: number,
    rowHeight: number
  ): TaskOrFiller[] {
    if (containerHeight <= 0) return realTasks;

    const visibleRowsCount = Math.ceil(containerHeight / rowHeight);
    const fillerCount = Math.max(0, visibleRowsCount - realTasks.length);

    if (fillerCount === 0) return realTasks;

    const extendedTasks: TaskOrFiller[] = [...realTasks];
    
    // Находим базовые даты для филлеров (чтобы они не ломали масштаб)
    const defaultStart = realTasks.length > 0 
      ? new Date(Math.min(...realTasks.map(t => new Date(t.startDate).getTime())))
      : new Date();
    
    const defaultEnd = realTasks.length > 0
      ? new Date(Math.max(...realTasks.map(t => new Date(t.endDate).getTime())))
      : new Date(defaultStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < fillerCount; i++) {
      extendedTasks.push({
        id: `filler-${i}`,
        name: '', // Пустое имя
        startDate: defaultStart,
        endDate: defaultEnd,
        progress: 0,
        type: 'task',
        level: 1,
        isDisabled: true, // Отключаем взаимодействие
        isFiller: true    // Пометка для CSS
      });
    }

    return extendedTasks;
  }

  /**
   * Вычисляет дату окончания так, чтобы сетка Ганта заполняла всю ширину контейнера.
   * 
   * @param startDate - Дата начала проекта
   * @param realEndDate - Дата окончания последней задачи
   * @param containerWidth - Ширина контейнера в пикселях
   * @param columnWidth - Ширина одной колонки (зависит от зума)
   * @param viewMode - Текущий режим отображения (Day, Week, Month)
   * @returns Оптимальная дата окончания для рендеринга
   */
  public calculateExtendedEndDate(
    startDate: Date,
    realEndDate: Date,
    containerWidth: number,
    columnWidth: number,
    viewMode: string // Принимаем строку или enum из библиотеки
  ): Date {
    if (containerWidth <= 0 || columnWidth <= 0) return realEndDate;

    // Определяем коэффициент дней в одной колонке в зависимости от режима
    let daysPerColumn = 1;
    if (viewMode.toLowerCase().includes('week')) {
      daysPerColumn = 7;
    } else if (viewMode.toLowerCase().includes('month')) {
      daysPerColumn = 30;
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    // Вычисляем сколько колонок помещается в экран
    const visibleColumns = Math.ceil(containerWidth / columnWidth);
    // Вычисляем сколько это дней (колонки * дни_в_колонке) + запас
    const neededDays = (visibleColumns + 2) * daysPerColumn;
    
    const minEndDate = new Date(startDate.getTime() + neededDays * msPerDay);

    return realEndDate > minEndDate ? realEndDate : minEndDate;
  }
}
