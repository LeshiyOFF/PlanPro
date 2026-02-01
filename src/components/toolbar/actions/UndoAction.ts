import { ToolbarAction } from './ToolbarAction'
import { IToolbarButton } from '../interfaces/ToolbarInterfaces'
import { undoRedoService } from '../../../services/UndoRedoService'
import type { UndoRedoState } from '../../../services/UndoRedoService'

/**
 * Действие для отмены последнего действия
 * Стандартная кнопка тулбара TB005
 */
export class UndoAction extends ToolbarAction {
  private state: UndoRedoState | null = null
  private unsubscribe: (() => void) | null = null

  constructor() {
    super('TB005', 'Отменить', '↩️', 'Отменить последнее действие (Ctrl+Z)', 'Ctrl+Z')
    this.unsubscribe = undoRedoService.addStateListener((s) => {
      this.state = s
    })
  }

  /**
   * Выполняет отмену действия
   */
  override async execute(): Promise<void> {
    console.log('Отмена действия')
    if (!this.state?.canUndo) {
      return
    }
    // Интеграция с HistoryManager или UndoStack — при подключении сервиса
  }

  /**
   * Проверяет, можно ли выполнить отмену
   */
  override canExecute(): boolean {
    return this.state?.canUndo ?? false
  }

  /**
   * Создаёт экземпляр кнопки для тулбара
   */
  createButton(): IToolbarButton {
    return {
      id: this.id,
      label: this.label,
      icon: this.icon,
      tooltip: this.tooltip,
      disabled: !this.canExecute(),
      onClick: () => this.execute(),
      onKeyDown: (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
          event.preventDefault()
          this.execute()
        }
      },
    }
  }
}

