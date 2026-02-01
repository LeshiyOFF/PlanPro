/**
 * Аргументы Java API — JSON-сериализуемые значения.
 */
export type JavaCommandArg =
  | string
  | number
  | boolean
  | null
  | JavaCommandArg[]
  | { [key: string]: JavaCommandArg }

export type JavaCommandArgs = JavaCommandArg[]
