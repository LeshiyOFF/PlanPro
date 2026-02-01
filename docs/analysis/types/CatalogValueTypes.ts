/**
 * Общие типы для значений в Master_Functionality_Catalog
 * Используются для устранения any в полях value, parameters, data, content и др.
 */

/**
 * Произвольное значение (JSON-совместимое)
 */
export type CatalogValue =
  | string
  | number
  | boolean
  | null
  | CatalogValue[]
  | { [key: string]: CatalogValue };
