import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { CurrencyFormatter } from './CurrencyFormatter';
import { Duration } from '@/types/Master_Functionality_Catalog';
import { resolveTimeUnitKey } from './TimeUnitMapper';
import i18next from 'i18next';

/**
 * Утилиты для централизованного форматирования данных
 * Используют пользовательские настройки для определения формата
 */

/**
 * Форматирование длительности с использованием динамических единиц.
 * Внедрено интеллектуальное округление (Stage 7.18)
 * Добавлена защита от некорректных данных (Stage 7.19)
 */
export const formatDuration = (duration: number | Duration | undefined | null, unit?: Duration['unit']): string => {
  // ЗАЩИТА: Если duration не предоставлен или некорректен (Stage 7.19)
  if (duration === undefined || duration === null) {
    return '0 ' + i18next.t(`units.days`);
  }
  
  const prefs = UserPreferencesService.getInstance().getPreferences() as any;
  
  // ЗАЩИТА: Извлечение значения с проверкой типа (Stage 7.19)
  let value: number;
  if (typeof duration === 'number') {
    value = duration;
  } else if (typeof duration === 'object' && duration.value !== undefined && duration.value !== null) {
    value = duration.value;
  } else {
    // Некорректный тип или объект без value
    console.warn('[formatDuration] Invalid duration received:', duration);
    return '0 ' + i18next.t(`units.days`);
  }
  
  // ЗАЩИТА: Проверка, что value - это валидное число (Stage 7.19)
  if (isNaN(value) || !isFinite(value)) {
    console.warn('[formatDuration] NaN or Infinite value:', value);
    return '0 ' + i18next.t(`units.days`);
  }
  
  const rawUnit = (typeof duration !== 'number' && typeof duration === 'object' && duration.unit) || unit || 
                    prefs.schedule?.durationEnteredIn || 'days';
  
  // Преобразуем числовой код в строку для i18n
  const finalUnit = resolveTimeUnitKey(rawUnit);

  // Интеллектуальное округление (Stage 7.18)
  const roundedValue = Math.abs(value - Math.round(value)) < 0.01 
    ? Math.round(value) 
    : Number(value.toFixed(2));

  return `${roundedValue} ${i18next.t(`units.${finalUnit}`)}`;
};

/**
 * Форматирование трудозатрат (Work) с использованием динамических единиц.
 * Добавлена защита от некорректных данных (Stage 7.19)
 */
export const formatWork = (work: number | Duration | undefined | null, unit?: Duration['unit']): string => {
  // ЗАЩИТА: Если work не предоставлен или некорректен (Stage 7.19)
  if (work === undefined || work === null) {
    return '0 ' + i18next.t(`units.hours`);
  }
  
  const prefs = UserPreferencesService.getInstance().getPreferences() as any;
  
  // ЗАЩИТА: Извлечение значения с проверкой типа (Stage 7.19)
  let value: number;
  if (typeof work === 'number') {
    value = work;
  } else if (typeof work === 'object' && work.value !== undefined && work.value !== null) {
    value = work.value;
  } else {
    // Некорректный тип или объект без value
    console.warn('[formatWork] Invalid work value received:', work);
    return '0 ' + i18next.t(`units.hours`);
  }
  
  // ЗАЩИТА: Проверка, что value - это валидное число (Stage 7.19)
  if (isNaN(value) || !isFinite(value)) {
    console.warn('[formatWork] NaN or Infinite value:', value);
    return '0 ' + i18next.t(`units.hours`);
  }
  
  const rawUnit = (typeof work !== 'number' && typeof work === 'object' && work.unit) || unit || 
                    prefs.schedule?.workUnit || 'hours';
  
  // Преобразуем числовой код в строку для i18n
  const finalUnit = resolveTimeUnitKey(rawUnit);

  // Интеллектуальное округление (Stage 7.18)
  const roundedValue = Math.abs(value - Math.round(value)) < 0.01 
    ? Math.round(value) 
    : Number(value.toFixed(2));

  return `${roundedValue} ${i18next.t(`units.${finalUnit}`)}`;
};

/**
 * Форматирование ставки (Rate) с использованием динамических единиц.
 */
export const formatRate = (amount: number, unit?: Duration['unit'] | number): string => {
  const prefs = UserPreferencesService.getInstance().getPreferences() as any;
  let finalUnit = unit || prefs.schedule?.workUnit || 'hours';
  
  // Маппинг числовых TimeUnit из Java (Stage 8.14)
  // Обрабатываем и числа, и строки-числа (Stage 8.15)
  const unitCode = typeof finalUnit === 'string' ? parseInt(finalUnit, 10) : finalUnit;
  if (!isNaN(unitCode as number) && typeof unitCode === 'number') {
    const unitMap: Record<number, string> = {
      3: 'minutes',
      4: 'hours',
      5: 'days',
      6: 'weeks',
      7: 'months'
    };
    if (unitMap[unitCode]) {
      finalUnit = unitMap[unitCode];
    }
  }

  // Для ставок мы обычно используем сокращенную форму "/ед"
  return `${formatCurrency(amount)}/${i18next.t(`units.${finalUnit}`)}`;
};

/**
 * Форматирование даты в соответствии с настройками пользователя
 * Исправлен формат для русской локали (Stage 7.19)
 */
export const formatDate = (date: Date | number | string): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const prefs = UserPreferencesService.getInstance().getGeneralPreferences();
  const locale = prefs.language === 'ru-RU' ? ru : enUS;
  
  // Умный выбор формата с уважением к пользователю (Stage 7.20)
  // Автоматически исправляем "ошибочный" американский формат для русского языка,
  // но уважаем явный выбор пользователя (например, ISO формат)
  let formatStr: string;
  if (prefs.language === 'ru-RU') {
    // Если формат не задан или это дефолтный американский (ошибка импорта/инициализации)
    if (!prefs.dateFormat || prefs.dateFormat === 'MM/dd/yyyy' || prefs.dateFormat === 'MM/DD/YYYY') {
      formatStr = 'dd.MM.yyyy'; // Умный дефолт для России
    } else {
      // Уважаем явный выбор пользователя (ISO, европейский с / и т.д.)
      formatStr = prefs.dateFormat;
    }
  } else {
    formatStr = prefs.dateFormat || 'MM/dd/yyyy'; // Американский для английского
  }
  
  // date-fns использует другие токены для года (y вместо Y) и дня (d вместо D)
  const normalizedFormat = formatStr
    .replace(/YYYY/g, 'yyyy')
    .replace(/YY/g, 'yy')
    .replace(/DD/g, 'dd')
    .replace(/D/g, 'd');

  return format(d, normalizedFormat, { locale });
};

/**
 * Форматирование валюты в соответствии с настройками пользователя
 */
export const formatCurrency = (amount: number): string => {
  return CurrencyFormatter.format(amount);
};

/**
 * Форматирование времени в соответствии с настройками пользователя
 */
export const formatTime = (date: Date | number | string): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const prefs = UserPreferencesService.getInstance().getGeneralPreferences();
  const formatStr = prefs.timeFormat || 'HH:mm';
  const locale = prefs.language === 'ru-RU' ? ru : enUS;
  
  return format(d, formatStr, { locale });
};

/**
 * Локализация системных имен календарей
 * Преобразует "Standard" -> "Стандартный" и т.д. на основе i18n
 * 
 * @param name - Оригинальное имя календаря
 * @returns Локализованное имя
 */
export const formatCalendarName = (name: string | undefined | null): string => {
  if (!name) return i18next.t('calendars.standard'); // Дефолт если пусто
  
  // Генерируем ключ: заменяем пробелы на подчеркивания и в нижний регистр
  const key = String(name).toLowerCase().replace(/\s+/g, '_');
  
  // Пытаемся найти перевод в i18n
  const localized = i18next.t(`calendars.${key}`, { defaultValue: '' });
  
  if (localized) return localized;
  
  // Если перевода нет, возвращаем оригинал с заглавной буквы
  return String(name).charAt(0).toUpperCase() + String(name).slice(1);
};

/**
 * Локализация маски формата даты/времени для отображения в UI
 * Преобразует технические аббревиатуры в понятные пользователю символы
 * 
 * @param mask - Техническая маска (DD.MM.YYYY, HH:mm)
 * @param language - Язык пользователя (ru-RU, en-US)
 * @returns Локализованная маска (ДД.ММ.ГГГГ для RU, оригинал для EN)
 * 
 * @example
 * localizeFormatMask('DD.MM.YYYY', 'ru-RU') // 'ДД.ММ.ГГГГ'
 * localizeFormatMask('HH:mm:ss', 'ru-RU')   // 'ЧЧ:мм:сс'
 * localizeFormatMask('DD.MM.YYYY', 'en-US') // 'DD.MM.YYYY'
 */
export const localizeFormatMask = (mask: string, language: string): string => {
  if (language === 'ru-RU') {
    return mask
      .replace(/YYYY/g, 'ГГГГ')
      .replace(/YY/g, 'ГГ')
      .replace(/DD/g, 'ДД')
      .replace(/MM/g, 'ММ')
      .replace(/HH/g, 'ЧЧ')
      .replace(/hh/g, 'чч')
      .replace(/mm/g, 'мм')
      .replace(/ss/g, 'сс');
  }
  return mask; // Для английского и других языков оставляем как есть
};

