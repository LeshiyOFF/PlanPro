import { BaseAction } from './BaseAction';
import type { UIEvent } from '@/types/Master_Functionality_Catalog';
import { EventType } from '@/types/Master_Functionality_Catalog';
import { logger } from '@/utils/logger';

/**
 * Action для поиска
 */
export class SearchAction extends BaseAction {
  public readonly id = 'search';
  public readonly name = 'Поиск';
  public readonly description = 'Найти задачи или ресурсы';

  constructor() {
    super({ shortcut: 'Ctrl+F', icon: 'search' });
  }

  public canExecute(): boolean {
    return true;
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.SEARCH_ACTION, { query: '' });
    // TODO: Implement search dialog
    logger.info('Search functionality requested');
  }
}
