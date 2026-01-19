import { BaseMenuAction } from '../entities/BaseMenuAction';
import { logger } from '@/utils/logger';

/**
 * Действие удаления
 */
export class DeleteAction extends BaseMenuAction {
  constructor(
    private readonly target: any,
    private readonly onDelete?: (target: any) => Promise<void>
  ) {
    super('Удалить', '🗑️', 'Delete');
  }

  async execute(): Promise<void> {
    try {
      // TODO: Добавить диалог подтверждения
      const confirmed = window.confirm(`Удалить элемент: ${this.getTargetName()}?`);
      
      if (!confirmed) {
        logger.info('Delete action cancelled by user');
        return;
      }

      if (this.onDelete) {
        await this.onDelete(this.target);
      } else {
        // Временная реализация
        logger.warn('Delete action called without delete handler');
      }
      
      logger.info('Item deleted successfully:', this.target);
    } catch (error) {
      logger.error('Failed to delete item:', error);
      throw new Error('Не удалось удалить элемент');
    }
  }

  canExecute(): boolean {
    return this.target !== null && this.target !== undefined;
  }

  private getTargetName(): string {
    if (typeof this.target === 'string') return this.target;
    if (this.target?.name) return this.target.name;
    if (this.target?.id) return this.target.id;
    if (this.target?.title) return this.target.title;
    return 'элемент';
  }
}
