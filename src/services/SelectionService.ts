import { logger } from '@/utils/logger'

/**
 * Тип выделения
 */
export type SelectionType = 'task' | 'resource' | 'text' | 'none';

/**
 * Информация о выделении
 */
export interface SelectionInfo {
  type: SelectionType;
  count: number;
  ids: string[];
}

/**
 * Сервис управления выделением
 * Отслеживает выделенные элементы в различных представлениях
 */
class SelectionService {
  private static instance: SelectionService
  private currentSelection: SelectionInfo = {
    type: 'none',
    count: 0,
    ids: [],
  }

  private constructor() {
    this.initializeListeners()
  }

  static getInstance(): SelectionService {
    if (!SelectionService.instance) {
      SelectionService.instance = new SelectionService()
    }
    return SelectionService.instance
  }

  /**
   * Проверяет наличие выделения
   */
  hasSelection(): boolean {
    return this.currentSelection.count > 0 || this.hasTextSelection()
  }

  /**
   * Проверяет наличие текстового выделения
   */
  hasTextSelection(): boolean {
    const selection = window.getSelection()
    return selection !== null && selection.toString().length > 0
  }

  /**
   * Возвращает текущее выделение
   */
  getSelection(): SelectionInfo {
    return { ...this.currentSelection }
  }

  /**
   * Устанавливает выделение
   */
  setSelection(type: SelectionType, ids: string[]): void {
    this.currentSelection = {
      type,
      count: ids.length,
      ids,
    }
    logger.dialog('Selection changed', { type, count: ids.length }, 'Selection')
  }

  /**
   * Очищает выделение
   */
  clearSelection(): void {
    this.currentSelection = {
      type: 'none',
      count: 0,
      ids: [],
    }
  }

  /**
   * Получает выделенный текст
   */
  getSelectedText(): string {
    const selection = window.getSelection()
    return selection ? selection.toString() : ''
  }

  /**
   * Инициализирует слушатели событий
   */
  private initializeListeners(): void {
    document.addEventListener('selectionchange', () => {
      const hasText = this.hasTextSelection()
      if (hasText && this.currentSelection.type === 'none') {
        this.currentSelection = {
          type: 'text',
          count: 1,
          ids: [],
        }
      } else if (!hasText && this.currentSelection.type === 'text') {
        this.clearSelection()
      }
    })
  }

  /**
   * Проверяет, выделен ли конкретный элемент
   */
  isSelected(id: string): boolean {
    return this.currentSelection.ids.includes(id)
  }

  /**
   * Добавляет элемент к выделению
   */
  addToSelection(type: SelectionType, id: string): void {
    if (!this.currentSelection.ids.includes(id)) {
      this.currentSelection.type = type
      this.currentSelection.ids.push(id)
      this.currentSelection.count = this.currentSelection.ids.length
      logger.dialog('Item added to selection', { type, id }, 'Selection')
    }
  }

  /**
   * Удаляет элемент из выделения
   */
  removeFromSelection(id: string): void {
    const index = this.currentSelection.ids.indexOf(id)
    if (index !== -1) {
      this.currentSelection.ids.splice(index, 1)
      this.currentSelection.count = this.currentSelection.ids.length
      if (this.currentSelection.count === 0) {
        this.currentSelection.type = 'none'
      }
      logger.dialog('Item removed from selection', { id }, 'Selection')
    }
  }
}

export { SelectionService }
export const selectionService = SelectionService.getInstance()
