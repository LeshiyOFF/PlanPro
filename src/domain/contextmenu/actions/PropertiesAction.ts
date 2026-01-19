import { BaseMenuAction } from '../entities/BaseMenuAction';
import { logger } from '@/utils/logger';

/**
 * Действие редактирования свойств
 */
export class PropertiesAction extends BaseMenuAction {
  constructor(
    private readonly target: any,
    private readonly onEdit?: (target: any) => Promise<void>
  ) {
    super('Свойства', 'ℹ️', 'F9');
  }

  async execute(): Promise<void> {
    try {
      if (this.onEdit) {
        await this.onEdit(this.target);
      } else {
        // Временная реализация - показать alert
        const info = this.formatTargetInfo();
        alert(`Свойства элемента:\n\n${info}`);
      }
      
      logger.info('Properties action executed for:', this.target);
    } catch (error) {
      logger.error('Failed to show properties:', error);
      throw new Error('Не удалось показать свойства элемента');
    }
  }

  canExecute(): boolean {
    return this.target !== null && this.target !== undefined;
  }

  private formatTargetInfo(): string {
    if (typeof this.target === 'object' && this.target !== null) {
      return Object.entries(this.target)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n');
    }
    
    return JSON.stringify(this.target, null, 2);
  }
}
