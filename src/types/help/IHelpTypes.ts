import { ReactNode } from 'react'

/**
 * Идентификаторы секций справки
 * Соответствуют основным views приложения
 */
export type HelpSectionId = 
  | 'GANTT'
  | 'NETWORK'
  | 'WBS'
  | 'RESOURCE_USAGE'
  | 'TASK_USAGE'
  | 'TRACKING'
  | 'CALENDAR'
  | 'REPORTS'
  | 'SETTINGS'
  | 'TASK_SHEET'
  | 'RESOURCE_SHEET'

/**
 * Блок контента внутри справочного модального окна
 * Каждый блок имеет заголовок, иконку и подробное описание
 */
export interface IHelpBlock {
  /** Заголовок блока */
  readonly title: string
  /** React-компонент иконки (из lucide-react) */
  readonly icon: ReactNode
  /** Tailwind-класс цвета иконки */
  readonly iconColor: string
  /** Tailwind-класс фона иконки */
  readonly iconBg: string
  /** Подробное описание (может содержать JSX) */
  readonly content: ReactNode
}

/**
 * Полная секция справки для модального окна
 * Содержит метаданные секции и массив блоков
 */
export interface IHelpSection {
  /** Основной заголовок (например, "Диаграмма Ганта") */
  readonly title: string
  /** Подзаголовок (например, "Планирование временных графиков") */
  readonly subtitle: string
  /** Иконка секции для шапки модального окна */
  readonly icon: ReactNode
  /** Массив информационных блоков */
  readonly blocks: readonly IHelpBlock[]
}

/**
 * Props для компонента HelpModal
 */
export interface IHelpModalProps {
  /** Состояние открытия модального окна */
  readonly isOpen: boolean
  /** Callback закрытия модального окна */
  readonly onClose: () => void
  /** ID секции для отображения контента */
  readonly sectionId: HelpSectionId
}

/**
 * Props для компонента HelpBlockItem (отдельный блок)
 */
export interface IHelpBlockItemProps {
  /** Данные блока */
  readonly block: IHelpBlock
  /** Индекс для key */
  readonly index: number
}
