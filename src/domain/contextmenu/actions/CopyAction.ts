import { BaseMenuAction } from '../entities/BaseMenuAction';
import { logger } from '@/utils/logger';

/**
 * Действие копирования
 */
export class CopyAction extends BaseMenuAction {
  constructor(private readonly target: any) {
    super('Копировать', '📋', 'Ctrl+C');
  }

  async execute(): Promise<void> {
    try {
      // TODO: Реализация копирования в буфер обмена
      logger.info('Copying item:', this.target);
      
      // Временная реализация
      const text = JSON.stringify(this.target, null, 2);
      await navigator.clipboard.writeText(text);
      
      logger.info('Item copied to clipboard successfully');
    } catch (error) {
      logger.error('Failed to copy item:', error);
      throw new Error('Не удалось скопировать элемент');
    }
  }

  canExecute(): boolean {
    return this.target !== null && this.target !== undefined;
  }
}

