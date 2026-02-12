import { TFunction } from 'i18next'
import { HelpSectionId, IHelpSection } from '@/types/help'
import {
  getGanttHelpSection,
  getNetworkHelpSection,
  getWbsHelpSection,
  getResourceUsageHelpSection,
  getTaskUsageHelpSection,
  getTrackingHelpSection,
  getCalendarHelpSection,
  getReportsHelpSection,
  getSettingsHelpSection,
  getTaskSheetHelpSection,
  getResourceSheetHelpSection,
} from './help-sections'

/**
 * Маппинг секций на функции получения контента
 * Каждая секция имеет свой отдельный модуль для соблюдения SRP
 */
const sectionGetters: Record<HelpSectionId, (t: TFunction) => IHelpSection> = {
  GANTT: getGanttHelpSection,
  NETWORK: getNetworkHelpSection,
  WBS: getWbsHelpSection,
  RESOURCE_USAGE: getResourceUsageHelpSection,
  TASK_USAGE: getTaskUsageHelpSection,
  TRACKING: getTrackingHelpSection,
  CALENDAR: getCalendarHelpSection,
  REPORTS: getReportsHelpSection,
  SETTINGS: getSettingsHelpSection,
  TASK_SHEET: getTaskSheetHelpSection,
  RESOURCE_SHEET: getResourceSheetHelpSection,
}

/**
 * Получает контент справки для указанной секции
 * @param sectionId - Идентификатор секции
 * @param t - Функция перевода i18next
 * @returns Объект IHelpSection с полным контентом секции
 */
export const getHelpContent = (
  sectionId: HelpSectionId,
  t: TFunction
): IHelpSection => {
  const getter = sectionGetters[sectionId]
  return getter(t)
}

/**
 * Проверяет, существует ли контент для указанной секции
 * @param sectionId - Идентификатор секции
 * @returns true если секция существует
 */
export const hasHelpContent = (sectionId: string): sectionId is HelpSectionId => {
  return sectionId in sectionGetters
}
