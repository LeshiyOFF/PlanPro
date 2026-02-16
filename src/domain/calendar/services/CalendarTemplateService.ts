import {
  ICalendarTemplate,
  CalendarTemplateType,
  IWorkingDay,
  IWorkCalendar,
} from '../interfaces/IWorkCalendar'

/**
 * Сервис шаблонов календарей
 * Предоставляет готовые графики работы для быстрого создания календарей
 * Stage 8.15: Эталонная система управления графиками
 */
export class CalendarTemplateService {
  private static instance: CalendarTemplateService

  public static getInstance(): CalendarTemplateService {
    if (!CalendarTemplateService.instance) {
      CalendarTemplateService.instance = new CalendarTemplateService()
    }
    return CalendarTemplateService.instance
  }

  /**
   * Получить все доступные шаблоны
   */
  public getAllTemplates(): ICalendarTemplate[] {
    return [
      this.getStandardTemplate(),
      this.getTwentyFourSevenTemplate(),
      this.getNightShiftTemplate(),
      this.getTwoTwoTemplate(),
      this.getThreeOneTemplate(),
      this.getFourThreeTemplate(),
      this.getShiftFifteenTemplate(),
      this.getShiftThirtyTemplate(),
      this.getSixDaysTemplate(),
    ]
  }

  /**
   * Генерация динамического краткого описания на основе рабочих дней
   */
  public generateShortDescription(calendar: Partial<IWorkCalendar>): string {
    const workingDays = calendar.workingDays || []
    const activeDays = workingDays.filter(wd => wd.isWorking)

    if (activeDays.length === 0) return 'Нет рабочих дней'
    if (activeDays.length === 7) return `${calendar.hoursPerDay}ч/дн, 7/7 (Без выходных)`

    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

    // Сортируем дни с Пн по Вс
    const sortedDays = [...activeDays].sort((a, b) => {
      const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek
      const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek
      return orderA - orderB
    })

    const activeDayLabels = sortedDays.map(d => dayNames[d.dayOfWeek]).join(', ')
    return `${calendar.hoursPerDay}ч/дн, ${activeDays.length}/7 (${activeDayLabels})`
  }

  /**
   * Проверка: совпадает ли текущий график с шаблоном
   */
  public isMatchingTemplate(workingDays: IWorkingDay[], template: ICalendarTemplate): boolean {
    if (workingDays.length !== template.workingDays.length) return false

    return workingDays.every(wd => {
      const twd = template.workingDays.find(t => t.dayOfWeek === wd.dayOfWeek)
      if (!twd) return false
      if (wd.isWorking !== twd.isWorking) return false
      if (wd.isWorking) {
        if (wd.workingHours?.start !== twd.workingHours?.start) return false
        if (wd.workingHours?.end !== twd.workingHours?.end) return false
      }
      return true
    })
  }

  /**
   * Стандартный график «Пятидневка»: 5/2, Пн-Пт 09:00-18:00 (совпадает с Core/API).
   */
  private getStandardTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.STANDARD,
      name: 'Пятидневка',
      description: 'Пятидневная рабочая неделя с выходными в субботу и воскресенье',
      shortDescription: '8ч/дн, 5/2, Пн-Пт',
      hoursPerDay: 8,
      workingDaysPerWeek: 5,
      defaultWorkTime: {
        start: '09:00',
        end: '18:00',
      },
      workingDays: [
        { dayOfWeek: 0, isWorking: false }, // Воскресенье
        { dayOfWeek: 1, isWorking: true, workingHours: { start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' } },
        { dayOfWeek: 2, isWorking: true, workingHours: { start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' } },
        { dayOfWeek: 3, isWorking: true, workingHours: { start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' } },
        { dayOfWeek: 4, isWorking: true, workingHours: { start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' } },
        { dayOfWeek: 5, isWorking: true, workingHours: { start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' } },
        { dayOfWeek: 6, isWorking: false },  // Суббота
      ],
    }
  }

  /**
   * Круглосуточный график: 24/7
   */
  private getTwentyFourSevenTemplate(): ICalendarTemplate {
    const allDaysWorking: IWorkingDay[] = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isWorking: true,
      workingHours: { start: '00:00', end: '23:59' },
    }))

    return {
      type: CalendarTemplateType.TWENTY_FOUR_SEVEN,
      name: 'Круглосуточный (24/7)',
      description: 'Непрерывная работа без выходных (для оборудования, серверов, производственных линий)',
      shortDescription: '24ч/дн, 7/7',
      hoursPerDay: 24,
      workingDaysPerWeek: 7,
      defaultWorkTime: {
        start: '00:00',
        end: '23:59',
      },
      workingDays: allDaysWorking,
    }
  }

  /**
   * Ночная смена: Пн-Пт 22:00-06:00
   */
  private getNightShiftTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.NIGHT_SHIFT,
      name: 'Ночная смена',
      description: 'Ночной график работы с 22:00 до 06:00, пятидневка',
      shortDescription: '8ч ночи, 5/2',
      hoursPerDay: 8,
      workingDaysPerWeek: 5,
      defaultWorkTime: {
        start: '22:00',
        end: '06:00',
      },
      workingDays: [
        { dayOfWeek: 0, isWorking: false },
        { dayOfWeek: 1, isWorking: true, workingHours: { start: '22:00', end: '06:00' } },
        { dayOfWeek: 2, isWorking: true, workingHours: { start: '22:00', end: '06:00' } },
        { dayOfWeek: 3, isWorking: true, workingHours: { start: '22:00', end: '06:00' } },
        { dayOfWeek: 4, isWorking: true, workingHours: { start: '22:00', end: '06:00' } },
        { dayOfWeek: 5, isWorking: true, workingHours: { start: '22:00', end: '06:00' } },
        { dayOfWeek: 6, isWorking: false },
      ],
    }
  }

  /**
   * График 2 через 2 (сутки): 12ч смена
   */
  private getTwoTwoTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.TWO_TWO,
      name: 'График 2/2',
      description: 'Двое суток работа, двое выходных. Цикл повторяется каждые 4 дня.',
      shortDescription: '12ч/дн, 2/2',
      hoursPerDay: 12,
      workingDaysPerWeek: 3.5, // В среднем: 2 раб дня на 4-дневный цикл = 3.5 дней в неделю
      defaultWorkTime: {
        start: '08:00',
        end: '20:00',
      },
      // Для циклических графиков базовое расписание условно (логика в CalendarMathService)
      workingDays: [
        { dayOfWeek: 0, isWorking: true, workingHours: { start: '08:00', end: '20:00' } },
        { dayOfWeek: 1, isWorking: true, workingHours: { start: '08:00', end: '20:00' } },
        { dayOfWeek: 2, isWorking: false },
        { dayOfWeek: 3, isWorking: false },
        { dayOfWeek: 4, isWorking: true, workingHours: { start: '08:00', end: '20:00' } },
        { dayOfWeek: 5, isWorking: true, workingHours: { start: '08:00', end: '20:00' } },
        { dayOfWeek: 6, isWorking: false },
      ],
    }
  }

  /**
   * График 3 через 1
   */
  private getThreeOneTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.THREE_ONE,
      name: 'График 3/1',
      description: 'Три дня работы, один день выходной. Подходит для охраны, операторов.',
      shortDescription: '8ч/дн, 3/1',
      hoursPerDay: 8,
      workingDaysPerWeek: 5.25, // 3 раб из 4 = 5.25 дней в неделю
      defaultWorkTime: {
        start: '08:00',
        end: '17:00',
      },
      workingDays: [
        { dayOfWeek: 0, isWorking: false },
        { dayOfWeek: 1, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 2, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 3, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 4, isWorking: false },
        { dayOfWeek: 5, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 6, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
      ],
    }
  }

  /**
   * График 4 через 3
   */
  private getFourThreeTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.FOUR_THREE,
      name: 'График 4/3',
      description: 'Четыре дня работы, три дня выходных',
      shortDescription: '8ч/дн, 4/3',
      hoursPerDay: 8,
      workingDaysPerWeek: 4,
      defaultWorkTime: {
        start: '08:00',
        end: '17:00',
      },
      workingDays: [
        { dayOfWeek: 0, isWorking: false },
        { dayOfWeek: 1, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 2, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 3, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 4, isWorking: true, workingHours: { start: '08:00', end: '17:00' } },
        { dayOfWeek: 5, isWorking: false },
        { dayOfWeek: 6, isWorking: false },
      ],
    }
  }

  /**
   * Вахта 15 через 15
   */
  private getShiftFifteenTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.SHIFT_FIFTEEN,
      name: 'Вахта 15/15',
      description: 'Вахтовый метод: 15 дней работы, 15 дней отдыха. Типично для нефтегаза, строительства.',
      shortDescription: '12ч/дн, 15/15',
      hoursPerDay: 12,
      workingDaysPerWeek: 3.5, // 15 рабочих из 30 дней цикла = 3.5 дней/неделю
      defaultWorkTime: {
        start: '08:00',
        end: '20:00',
      },
      // Циклический график (логика в расчетах)
      workingDays: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        isWorking: true,
        workingHours: { start: '08:00', end: '20:00' },
      })),
    }
  }

  /**
   * Вахта 30 через 30
   */
  private getShiftThirtyTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.SHIFT_THIRTY,
      name: 'Вахта 30/30',
      description: 'Месяц работы, месяц отдыха. Используется в удаленных проектах (Крайний Север, море).',
      shortDescription: '12ч/дн, 30/30',
      hoursPerDay: 12,
      workingDaysPerWeek: 3.5,
      defaultWorkTime: {
        start: '08:00',
        end: '20:00',
      },
      workingDays: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        isWorking: true,
        workingHours: { start: '08:00', end: '20:00' },
      })),
    }
  }

  /**
   * Шестидневка: Вс выходной
   */
  private getSixDaysTemplate(): ICalendarTemplate {
    return {
      type: CalendarTemplateType.SIX_DAYS,
      name: 'Шестидневка',
      description: 'Шесть рабочих дней в неделю, воскресенье выходной',
      shortDescription: '8ч/дн, 6/1',
      hoursPerDay: 8,
      workingDaysPerWeek: 6,
      defaultWorkTime: {
        start: '09:00',
        end: '18:00',
      },
      workingDays: [
        { dayOfWeek: 0, isWorking: false }, // Воскресенье
        { dayOfWeek: 1, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 2, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 3, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 4, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 5, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 6, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
      ],
    }
  }

  /**
   * Создать календарь из шаблона.
   * V2.0: Генерирует ID в формате custom_<UUID>_<sanitized_name>.
   */
  public createFromTemplate(template: ICalendarTemplate, customName?: string): IWorkCalendar {
    const now = new Date()
    const calendarName = customName || template.name
    const calendarId = this.generateCalendarIdWithName(calendarName)

    return {
      id: calendarId,
      name: calendarName,
      description: template.description,
      templateType: template.type,
      workingDays: [...template.workingDays],
      exceptions: [],
      hoursPerDay: template.hoursPerDay,
      workingDaysPerWeek: template.workingDaysPerWeek,
      isBase: false,
      createdAt: now,
      updatedAt: now,
    }
  }

  /**
   * Генерация ID календаря с именем.
   * V2.0: Формат custom_<UUID>_<sanitized_name> для совместимости с Java backend.
   */
  private generateCalendarIdWithName(name: string): string {
    const base = this._generateCalendarId()
    const sanitizedName = this.sanitizeName(name)
    return base.replace(/_temp$/, `_${sanitizedName}`)
  }

  /**
   * Санитизация имени для использования в ID.
   * Совпадает с логикой Java CalendarIdConverter.sanitizeName().
   */
  private sanitizeName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Zа-яА-Я0-9\s-]/g, '') // Удаляем спецсимволы
      .replace(/\s+/g, '_') // Пробелы → подчеркивания
      .toLowerCase()
  }

  /**
   * Получить шаблон по типу
   */
  public getTemplateByType(type: CalendarTemplateType): ICalendarTemplate | undefined {
    return this.getAllTemplates().find(t => t.type === type)
  }

  /**
   * Создать пустой пользовательский календарь.
   * V2.0: Использует новый формат ID.
   */
  public createCustomCalendar(name: string): IWorkCalendar {
    const now = new Date()
    const calendarId = this.generateCalendarIdWithName(name)

    return {
      id: calendarId,
      name,
      description: 'Пользовательский календарь',
      templateType: CalendarTemplateType.CUSTOM,
      workingDays: [
        { dayOfWeek: 0, isWorking: false },
        { dayOfWeek: 1, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 2, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 3, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 4, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 5, isWorking: true, workingHours: { start: '09:00', end: '18:00' } },
        { dayOfWeek: 6, isWorking: false },
      ],
      exceptions: [],
      hoursPerDay: 8,
      workingDaysPerWeek: 5,
      isBase: false,
      createdAt: now,
      updatedAt: now,
    }
  }

  /**
   * Получить базовые (нельзя удалить) календари
   */
  public getBaseCalendars(): IWorkCalendar[] {
    const standardTemplate = this.getStandardTemplate()
    const nightTemplate = this.getNightShiftTemplate()
    const twentyFourTemplate = this.getTwentyFourSevenTemplate()

    return [
      { ...this.createFromTemplate(standardTemplate), isBase: true, id: 'standard' },
      { ...this.createFromTemplate(nightTemplate), isBase: true, id: 'night_shift' },
      { ...this.createFromTemplate(twentyFourTemplate), isBase: true, id: '24_7' },
    ]
  }

  /**
   * Генерация уникального ID календаря.
   * V2.0: Использует UUID вместо timestamp для стабильности и совместимости с Java backend.
   *
   * Формат: custom_<UUID>_<sanitized_name>
   * Где UUID - это первые 8 символов UUID v4
   */
  private _generateCalendarId(): string {
    // Генерация UUID v4 (упрощенная версия)
    const uuid = this.generateUUID().substring(0, 8)
    return `custom_${uuid}_temp` // Временное имя, будет заменено при сохранении
  }

  /**
   * Генерация UUID v4 (упрощенная версия для frontend).
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * Проверка, является ли дата рабочей для данного календаря
   */
  public isWorkingDay(calendar: IWorkCalendar, date: Date): boolean {
    // Сначала проверяем исключения (ex.date в CalendarException — строка ISO)
    const exception = calendar.exceptions.find(ex => {
      const exDate = new Date(ex.date)
      return exDate.getDate() === date.getDate() &&
        exDate.getMonth() === date.getMonth() &&
        exDate.getFullYear() === date.getFullYear()
    })

    if (exception) {
      return exception.type === 'working'
    }

    // Если нет исключения, смотрим базовый график
    const dayOfWeek = date.getDay()
    const workingDay = calendar.workingDays.find(wd => wd.dayOfWeek === dayOfWeek)

    return workingDay?.isWorking ?? false
  }

  /**
   * Получить рабочие часы для конкретной даты
   */
  public getWorkingHours(calendar: IWorkCalendar, date: Date): number {
    if (!this.isWorkingDay(calendar, date)) return 0

    // Проверяем исключения
    const exception = calendar.exceptions.find(ex => {
      const exDate = new Date(ex.date)
      return exDate.getDate() === date.getDate() &&
        exDate.getMonth() === date.getMonth() &&
        exDate.getFullYear() === date.getFullYear()
    })

    if (exception?.startTime != null && exception?.endTime != null) {
      return this.calculateHoursBetween(exception.startTime, exception.endTime)
    }

    // Базовый график
    const dayOfWeek = date.getDay()
    const workingDay = calendar.workingDays.find(wd => wd.dayOfWeek === dayOfWeek)

    if (workingDay?.workingHours) {
      const hours = this.calculateHoursBetween(
        workingDay.workingHours.start,
        workingDay.workingHours.end,
      )

      // Вычитаем перерыв, если есть
      if (workingDay.workingHours.breakStart && workingDay.workingHours.breakEnd) {
        const breakHours = this.calculateHoursBetween(
          workingDay.workingHours.breakStart,
          workingDay.workingHours.breakEnd,
        )
        return hours - breakHours
      }

      return hours
    }

    return calendar.hoursPerDay // Fallback
  }

  /**
   * Вспомогательный метод: расчет часов между двумя временными метками
   */
  private calculateHoursBetween(start: string, end: string): number {
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)

    let hours = endH - startH
    const minutes = endM - startM

    // Обработка перехода через полночь (ночная смена)
    if (hours < 0) {
      hours += 24
    }

    return hours + minutes / 60
  }
}
