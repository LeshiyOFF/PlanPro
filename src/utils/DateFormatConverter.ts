/**
 * Конвертер форматов даты между date-fns и SimpleDateFormat
 * 
 * Решает проблему несовместимости токенов:
 * - date-fns (JavaScript): DD, YYYY, MM, etc.
 * - SimpleDateFormat (Java): dd, yyyy, MM, etc.
 * 
 * @module DateFormatConverter
 */

/**
 * Маппинг токенов date-fns -> SimpleDateFormat
 */
const DATE_FNS_TO_JAVA_TOKENS: Record<string, string> = {
  // Год
  'YYYY': 'yyyy',  // Полный год (2024)
  'YY': 'yy',      // Короткий год (24)
  
  // Месяц
  'MMMM': 'MMMM',  // Полное название месяца (January)
  'MMM': 'MMM',    // Короткое название месяца (Jan)
  'MM': 'MM',      // Месяц с нулем (01-12)
  'M': 'M',        // Месяц без нуля (1-12)
  
  // День месяца
  'DD': 'dd',      // День с нулем (01-31)
  'D': 'd',        // День без нуля (1-31)
  
  // День недели
  'dddd': 'EEEE',  // Полное название дня (Monday)
  'ddd': 'EEE',    // Короткое название дня (Mon)
  'dd': 'EE',      // Очень короткое (Mo)
  'd': 'E',        // Однобуквенное (M)
  
  // Часы
  'HH': 'HH',      // Часы 24-формат с нулем (00-23)
  'H': 'H',        // Часы 24-формат без нуля (0-23)
  'hh': 'hh',      // Часы 12-формат с нулем (01-12)
  'h': 'h',        // Часы 12-формат без нуля (1-12)
  
  // Минуты и секунды
  'mm': 'mm',      // Минуты с нулем (00-59)
  'm': 'm',        // Минуты без нуля (0-59)
  'ss': 'ss',      // Секунды с нулем (00-59)
  's': 's',        // Секунды без нуля (0-59)
  
  // AM/PM
  'a': 'a',        // AM/PM
  'A': 'a',        // AM/PM (заглавные)
};

/**
 * Конвертирует формат даты из date-fns в SimpleDateFormat
 * 
 * @param dateFnsFormat - Формат даты в нотации date-fns
 * @returns Формат даты в нотации SimpleDateFormat
 * 
 * @example
 * convertDateFnsToJava('DD.MM.YYYY') // => 'dd.MM.yyyy'
 * convertDateFnsToJava('YYYY-MM-DD HH:mm') // => 'yyyy-MM-dd HH:mm'
 */
export function convertDateFnsToJava(dateFnsFormat: string): string {
  if (!dateFnsFormat) {
    return dateFnsFormat;
  }

  let javaFormat = dateFnsFormat;
  
  // Сортируем токены по длине (от большего к меньшему),
  // чтобы избежать частичной замены (например, YYYY перед YY)
  const sortedTokens = Object.keys(DATE_FNS_TO_JAVA_TOKENS)
    .sort((a, b) => b.length - a.length);
  
  // Заменяем токены, учитывая, что они могут быть внутри одинарных кавычек (литералы)
  for (const dateFnsToken of sortedTokens) {
    const javaToken = DATE_FNS_TO_JAVA_TOKENS[dateFnsToken];
    
    // Используем регулярное выражение для замены токенов вне кавычек
    // Паттерн: находим токен, но не внутри одинарных кавычек
    const regex = new RegExp(
      `(?<!')${escapeRegex(dateFnsToken)}(?!')`,
      'g'
    );
    
    javaFormat = javaFormat.replace(regex, javaToken);
  }
  
  return javaFormat;
}

/**
 * Конвертирует формат даты из SimpleDateFormat в date-fns
 * 
 * @param javaFormat - Формат даты в нотации SimpleDateFormat
 * @returns Формат даты в нотации date-fns
 * 
 * @example
 * convertJavaToDateFns('dd.MM.yyyy') // => 'DD.MM.YYYY'
 * convertJavaToDateFns('yyyy-MM-dd HH:mm') // => 'YYYY-MM-DD HH:mm'
 */
export function convertJavaToDateFns(javaFormat: string): string {
  if (!javaFormat) {
    return javaFormat;
  }

  let dateFnsFormat = javaFormat;
  
  // Создаем обратный маппинг
  const javaToDateFnsTokens: Record<string, string> = {};
  for (const [dateFns, java] of Object.entries(DATE_FNS_TO_JAVA_TOKENS)) {
    javaToDateFnsTokens[java] = dateFns;
  }
  
  // Сортируем токены по длине (от большего к меньшему)
  const sortedTokens = Object.keys(javaToDateFnsTokens)
    .sort((a, b) => b.length - a.length);
  
  for (const javaToken of sortedTokens) {
    const dateFnsToken = javaToDateFnsTokens[javaToken];
    
    const regex = new RegExp(
      `(?<!')${escapeRegex(javaToken)}(?!')`,
      'g'
    );
    
    dateFnsFormat = dateFnsFormat.replace(regex, dateFnsToken);
  }
  
  return dateFnsFormat;
}

/**
 * Экранирует специальные символы регулярного выражения
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Валидирует формат даты
 * 
 * @param format - Формат даты для валидации
 * @returns true, если формат валиден
 */
export function isValidDateFormat(format: string): boolean {
  if (!format || typeof format !== 'string') {
    return false;
  }
  
  // Проверяем, что формат содержит хотя бы один известный токен
  const allTokens = Object.keys(DATE_FNS_TO_JAVA_TOKENS);
  return allTokens.some(token => format.includes(token));
}

