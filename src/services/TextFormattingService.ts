import { logger } from '@/utils/logger'

/**
 * Тип стиля форматирования текста
 */
export type TextStyle = 'bold' | 'italic' | 'underline';

/**
 * Конфигурация текстового форматирования
 */
export interface TextFormatConfig {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

/**
 * Сервис форматирования текста в таблицах
 * Управляет стилями выделенного текста
 */
class TextFormattingService {
  private static instance: TextFormattingService
  private currentFormat: TextFormatConfig = {
    fontFamily: 'Arial',
    fontSize: 12,
    bold: false,
    italic: false,
    underline: false,
  }

  private constructor() {}

  static getInstance(): TextFormattingService {
    if (!TextFormattingService.instance) {
      TextFormattingService.instance = new TextFormattingService()
    }
    return TextFormattingService.instance
  }

  /**
   * Переключает стиль текста
   */
  toggleStyle(style: TextStyle): boolean {
    this.currentFormat[style] = !this.currentFormat[style]
    this.applyFormatting()
    logger.dialog(`Text style ${style}`, { enabled: this.currentFormat[style] }, 'TextFormatting')
    return this.currentFormat[style]
  }

  /**
   * Устанавливает семейство шрифта
   */
  setFontFamily(fontFamily: string): void {
    this.currentFormat.fontFamily = fontFamily
    this.applyFormatting()
    logger.dialog('Font family changed', { fontFamily }, 'TextFormatting')
  }

  /**
   * Устанавливает размер шрифта
   */
  setFontSize(fontSize: number): void {
    this.currentFormat.fontSize = fontSize
    this.applyFormatting()
    logger.dialog('Font size changed', { fontSize }, 'TextFormatting')
  }

  /**
   * Возвращает текущее состояние стиля
   */
  getStyleState(style: TextStyle): boolean {
    return this.currentFormat[style]
  }

  /**
   * Возвращает текущее семейство шрифта
   */
  getFontFamily(): string {
    return this.currentFormat.fontFamily
  }

  /**
   * Возвращает текущий размер шрифта
   */
  getFontSize(): number {
    return this.currentFormat.fontSize
  }

  /**
   * Применяет форматирование к активной ячейке таблицы
   */
  private applyFormatting(): void {
    const activeElement = document.activeElement
    if (!activeElement || !this.isEditableElement(activeElement)) {
      return
    }

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return
    }

    this.applyStylesToSelection(selection)
  }

  /**
   * Проверяет, является ли элемент редактируемым
   */
  private isEditableElement(element: Element): boolean {
    return element.hasAttribute('contenteditable') ||
           element.tagName === 'INPUT' ||
           element.tagName === 'TEXTAREA'
  }

  /**
   * Применяет стили к выделенному тексту
   */
  private applyStylesToSelection(selection: Selection): void {
    const range = selection.getRangeAt(0)
    const span = document.createElement('span')

    span.style.fontFamily = this.currentFormat.fontFamily
    span.style.fontSize = `${this.currentFormat.fontSize}pt`
    span.style.fontWeight = this.currentFormat.bold ? 'bold' : 'normal'
    span.style.fontStyle = this.currentFormat.italic ? 'italic' : 'normal'
    span.style.textDecoration = this.currentFormat.underline ? 'underline' : 'none'

    try {
      range.surroundContents(span)
    } catch (error) {
      logger.dialogError('Failed to apply formatting', error instanceof Error ? error : String(error), 'TextFormatting')
    }
  }

  /**
   * Сбрасывает форматирование к значениям по умолчанию
   */
  resetFormatting(): void {
    this.currentFormat = {
      fontFamily: 'Arial',
      fontSize: 12,
      bold: false,
      italic: false,
      underline: false,
    }
    logger.dialog('Formatting reset', {}, 'TextFormatting')
  }

  /**
   * Возвращает текущую конфигурацию форматирования
   */
  getCurrentFormat(): TextFormatConfig {
    return { ...this.currentFormat }
  }
}

export { TextFormattingService }
export const textFormattingService = TextFormattingService.getInstance()
