/**
 * Рекурсивные типы для JSON-значений (без any/unknown)
 * Переиспользуется из electron/types/JsonValue.ts для src/
 * Следует принципу DRY и обеспечивает type safety
 */

/**
 * Примитивные JSON-значения
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON-объект с рекурсивными значениями
 * Используем type вместо interface для корректной работы индексных сигнатур
 */
export type JsonObject = {
  [key: string]: JsonValue;
};

/**
 * JSON-массив
 */
export type JsonArray = JsonValue[];

/**
 * Объединение всех JSON-типов для type safety
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
