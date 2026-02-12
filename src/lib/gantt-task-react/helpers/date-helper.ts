import addYears from "date-fns/addYears";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import addHours from "date-fns/addHours";
import subYears from "date-fns/subYears";
import subMonths from "date-fns/subMonths";
import subDays from "date-fns/subDays";
import subHours from "date-fns/subHours";
import subWeeks from "date-fns/subWeeks";
import startOfYear from "date-fns/startOfYear";
import startOfMonth from "date-fns/startOfMonth";
import startOfDay from "date-fns/startOfDay";
import startOfHour from "date-fns/startOfHour";
import startOfWeek from "date-fns/startOfWeek";
import startOfQuarter from "date-fns/startOfQuarter";

import { TaskOrEmpty, ViewMode } from "../types/public-types";
import { getDatesDiff } from "./get-dates-diff";

/**
 * GANTT-NAV-V3: Вычисляет диапазон дат для диаграммы
 * @param tasks - массив задач
 * @param viewMode - режим отображения
 * @param preStepsCount - количество шагов буфера слева
 * @param forcedMinDate - принудительная минимальная дата (расширяет диапазон влево)
 * @param forcedMaxDate - принудительная максимальная дата (расширяет диапазон вправо)
 */
export const ganttDateRange = (
  tasks: readonly TaskOrEmpty[],
  viewMode: ViewMode,
  preStepsCount: number,
  forcedMinDate?: Date,
  forcedMaxDate?: Date
): [Date, Date, number] => {
  let minTaskDate: Date | null = null;
  let maxTaskDate: Date | null = null;
  for (const task of tasks) {
    if (task.type !== "empty") {
      if (!minTaskDate || task.start < minTaskDate) {
        minTaskDate = task.start;
      }
      if (!maxTaskDate || task.end > maxTaskDate) {
        maxTaskDate = task.end;
      }
    }
  }

  // GANTT-NAV-V3: Используем forced даты если они расширяют диапазон
  const effectiveMinDate = getEffectiveMinDate(minTaskDate, forcedMinDate);
  const effectiveMaxDate = getEffectiveMaxDate(maxTaskDate, forcedMaxDate);

  if (!effectiveMinDate || !effectiveMaxDate) {
    return [new Date(), new Date(), 2];
  }

  const [newStartDate, newEndDate] = calculateDateBounds(
    effectiveMinDate, effectiveMaxDate, viewMode, preStepsCount
  );

  return [
    newStartDate,
    minTaskDate || effectiveMinDate,
    getDatesDiff(newEndDate, newStartDate, viewMode),
  ];
};

/** Выбирает минимальную дату из задач и forced */
const getEffectiveMinDate = (taskMin: Date | null, forced?: Date): Date | null => {
  if (!taskMin && !forced) return null;
  if (!taskMin) return forced || null;
  if (!forced) return taskMin;
  return forced < taskMin ? forced : taskMin;
};

/** Выбирает максимальную дату из задач и forced */
const getEffectiveMaxDate = (taskMax: Date | null, forced?: Date): Date | null => {
  if (!taskMax && !forced) return null;
  if (!taskMax) return forced || null;
  if (!forced) return taskMax;
  return forced > taskMax ? forced : taskMax;
};

/** Вычисляет границы диапазона на основе viewMode */
const calculateDateBounds = (
  minDate: Date,
  maxDate: Date,
  viewMode: ViewMode,
  preStepsCount: number
): [Date, Date] => {
  switch (viewMode) {
    case ViewMode.Year:
      return [
        startOfYear(subYears(minDate, preStepsCount)),
        startOfYear(addYears(maxDate, 1))
      ];
    case ViewMode.QuarterYear:
      return [
        startOfQuarter(subMonths(minDate, preStepsCount * 3)),
        startOfQuarter(addMonths(maxDate, 6))
      ];
    case ViewMode.Month:
      return [
        startOfMonth(subMonths(minDate, preStepsCount)),
        startOfYear(addYears(maxDate, 1))
      ];
    case ViewMode.Week:
      return [
        subWeeks(startOfWeek(minDate), preStepsCount),
        addMonths(startOfDay(maxDate), 1.5)
      ];
    case ViewMode.TwoDays:
      return [
        subDays(startOfDay(minDate), preStepsCount),
        addDays(startOfDay(maxDate), 19)
      ];
    case ViewMode.Day:
      return [
        subDays(startOfDay(minDate), preStepsCount),
        addDays(startOfDay(maxDate), 30)
      ];
    case ViewMode.QuarterDay:
      return [
        subHours(startOfDay(minDate), preStepsCount * 6),
        addHours(startOfDay(maxDate), 66)
      ];
    case ViewMode.HalfDay:
      return [
        subHours(startOfDay(minDate), preStepsCount * 12),
        addHours(startOfDay(maxDate), 108)
      ];
    case ViewMode.Hour:
      return [
        subHours(startOfHour(minDate), preStepsCount),
        addDays(startOfDay(maxDate), 1)
      ];
    default:
      return [startOfDay(minDate), addDays(startOfDay(maxDate), 30)];
  }
};

export const getWeekNumberISO8601 = (date: Date) => {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay() + 7) % 7));
  }
  const weekNumber = (
    1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)
  ).toString();

  if (weekNumber.length === 1) {
    return `0${weekNumber}`;
  } else {
    return weekNumber;
  }
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};
