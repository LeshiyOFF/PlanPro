import { BaseMenuAction } from '../entities/BaseMenuAction'
import { logger } from '@/utils/logger'
import { getElectronAPI } from '@/utils/electronAPI'
import type { StrictData } from '@/types/Master_Functionality_Catalog'

/**
 * Действие удаления
 */
export class DeleteAction extends BaseMenuAction {
  constructor(
    private readonly target: StrictData,
    private readonly onDelete?: (target: StrictData) => Promise<void>,
  ) {
    super('Удалить', '🗑️', 'Delete')
  }

  async execute(): Promise<void> {
    try {
      const api = getElectronAPI()
      if (!api?.showMessageBox) return
      const confirmed = await api.showMessageBox({
        type: 'question',
        buttons: ['Удалить', 'Отмена'],
        defaultId: 1,
        title: 'Подтверждение удаления',
        message: `Вы уверены, что хотите удалить элемент: ${this.getTargetName()}?`,
        cancelId: 1,
      })

      if (confirmed.response !== 0) {
        logger.info('Delete action cancelled by user')
        return
      }

      if (this.onDelete) {
        const target: StrictData = this.target
        await this.onDelete(target)
      } else {
        logger.warn('Delete action called without delete handler')
      }

      logger.info('Item deleted successfully', { targetName: this.getTargetName() })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      logger.error('Failed to delete item:', { errorMessage })
      throw new Error('Не удалось удалить элемент')
    }
  }

  canExecute(): boolean {
    return this.target !== null && this.target !== undefined
  }

  private getTargetName(): string {
    const t = this.target
    if (typeof t === 'string') return t
    if (typeof t === 'object' && t !== null && !Array.isArray(t)) {
      const o = t as Record<string, StrictData>
      if (typeof o.name === 'string') return o.name
      if (o.id !== undefined) return String(o.id)
      if (typeof o.title === 'string') return o.title
    }
    return 'элемент'
  }
}

