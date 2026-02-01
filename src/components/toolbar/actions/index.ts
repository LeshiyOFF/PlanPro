/**
 * Экспорт всех действий тулбаров (TB001-TB007, TF001-TF005)
 * Следует принципу единственной ответственности - каждый класс в своём файле
 */

// Стандартный тулбар (TB001-TB007)
export { NewAction } from './NewAction'
export { OpenAction } from './OpenAction'
export { SaveAction } from './SaveAction'
export { SaveAsAction } from './SaveAsAction'
export { PrintAction } from './PrintAction'
export { UndoAction } from './UndoAction'
export { RedoAction } from './RedoAction'
export { FindAction } from './FindAction'

// Тулбар форматирования (TF001-TF005)
export { BoldAction } from './BoldAction'
export { ItalicAction } from './ItalicAction'
export { UnderlineAction } from './UnderlineAction'
export { FontSizeAction } from './FontSizeAction'
export { FontFamilyAction } from './FontFamilyAction'

