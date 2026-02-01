/**
 * Рекурсивный тип для JSON-значений (без any/unknown).
 * Используется для настроек, тела ответа Java API и санитизации.
 */
export type JsonPrimitive = string | number | boolean | null

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonArray = JsonValue[]

export type JsonValue = JsonPrimitive | JsonObject | JsonArray
