import { useCallback } from 'react'
import type { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar'

/**
 * Хук валидации календарей для предотвращения ошибок.
 *
 * ПРОВЕРКИ:
 * - Существование календаря в списке доступных
 * - Корректность формата ID
 * - Соответствие типу календаря (base/custom)
 *
 * Clean Architecture: Presentation Layer Hook.
 * SOLID: Single Responsibility - только валидация календарей.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
export function useCalendarValidation(calendars: IWorkCalendar[]) {

  /**
   * Проверяет, существует ли календарь с данным ID.
   */
  const isCalendarValid = useCallback((calendarId: string | undefined): boolean => {
    if (!calendarId) {
      console.warn('[CalendarValidation] Calendar ID is empty')
      return false
    }

    const exists = calendars.some(cal => cal.id === calendarId)

    if (!exists) {
      console.warn('[CalendarValidation] ⚠️ Calendar not found:', calendarId)
    }

    return exists
  }, [calendars])

  /**
   * Проверяет формат ID календаря.
   * Валидные форматы:
   * - "standard", "24_7", "night_shift" (системные)
   * - "custom_<UUID>_<name>" (кастомные)
   * - "CAL-<timestamp>" (legacy, для миграции)
   */
  const isCalendarIdFormatValid = useCallback((calendarId: string): boolean => {
    if (!calendarId) return false

    // Системные календари
    const systemCalendars = ['standard', '24_7', 'night_shift']
    if (systemCalendars.includes(calendarId)) {
      return true
    }

    // Кастомные календари (новый формат)
    if (calendarId.startsWith('custom_')) {
      return true
    }

    // Legacy формат (допускается для обратной совместимости)
    if (calendarId.startsWith('CAL-')) {
      console.warn('[CalendarValidation] ⚠️ Legacy format detected:', calendarId)
      return true
    }

    console.error('[CalendarValidation] ❌ Invalid calendar ID format:', calendarId)
    return false
  }, [])

  /**
   * Получает валидный fallback календарь если указанный не найден.
   */
  const getFallbackCalendar = useCallback((calendarId: string | undefined): string => {
    if (!calendarId || !isCalendarValid(calendarId)) {
      console.log('[CalendarValidation] Using fallback: standard')
      return 'standard'
    }
    return calendarId
  }, [isCalendarValid])

  /**
   * Валидация и санитизация ID перед отправкой в Backend.
   */
  const sanitizeCalendarId = useCallback((calendarId: string | undefined): string => {
    if (!calendarId || !isCalendarIdFormatValid(calendarId)) {
      return 'standard'
    }

    if (!isCalendarValid(calendarId)) {
      console.warn('[CalendarValidation] Calendar not in list, using fallback')
      return 'standard'
    }

    return calendarId
  }, [isCalendarIdFormatValid, isCalendarValid])

  return {
    isCalendarValid,
    isCalendarIdFormatValid,
    getFallbackCalendar,
    sanitizeCalendarId,
  }
}
