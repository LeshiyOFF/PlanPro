import { BaseAction } from './BaseAction';
import type { UIEvent } from '@/types/Master_Functionality_Catalog';
import { EventType } from '@/types/Master_Functionality_Catalog';
import { logger } from '@/utils/logger';

/**
 * Action для отмены действия
 */
export class UndoAction extends BaseAction {
  public readonly id = 'undo';
  public readonly name = 'Отменить';
  public readonly description = 'Отменить последнее действие';

  constructor(private appStore: any) {
    super({ shortcut: 'Ctrl+Z', icon: 'undo' });
  }

  public canExecute(): boolean {
    return this.appStore.canUndo;
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error('Нет действий для отмены');
    }

    this.logAction(EventType.EDIT_ACTION, { action: 'undo' });
    this.appStore.undoAction();
  }
}

/**
 * Action для повтора действия
 */
export class RedoAction extends BaseAction {
  public readonly id = 'redo';
  public readonly name = 'Повторить';
  public readonly description = 'Повторить последнее отмененное действие';

  constructor(private appStore: any) {
    super({ shortcut: 'Ctrl+Y', icon: 'redo' });
  }

  public canExecute(): boolean {
    return this.appStore.canRedo;
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error('Нет действий для повтора');
    }

    this.logAction(EventType.EDIT_ACTION, { action: 'redo' });
    this.appStore.redoAction();
  }
}

/**
 * Action для вырезания
 */
export class CutAction extends BaseAction {
  public readonly id = 'cut';
  public readonly name = 'Вырезать';
  public readonly description = 'Вырезать выделенное в буфер обмена';

  constructor(private appStore: any) {
    super({ shortcut: 'Ctrl+X', icon: 'cut' });
  }

  public canExecute(): boolean {
    return true; // TODO: Check if there's selection
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.EDIT_ACTION, { action: 'cut' });
    this.appStore.clipboard.cut();
  }
}

/**
 * Action для копирования
 */
export class CopyAction extends BaseAction {
  public readonly id = 'copy';
  public readonly name = 'Копировать';
  public readonly description = 'Копировать выделенное в буфер обмена';

  constructor(private appStore: any) {
    super({ shortcut: 'Ctrl+C', icon: 'copy' });
  }

  public canExecute(): boolean {
    return true; // TODO: Check if there's selection
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.EDIT_ACTION, { action: 'copy' });
    this.appStore.clipboard.copy();
  }
}

/**
 * Action для вставки
 */
export class PasteAction extends BaseAction {
  public readonly id = 'paste';
  public readonly name = 'Вставить';
  public readonly description = 'Вставить из буфера обмена';

  constructor(private appStore: any) {
    super({ shortcut: 'Ctrl+V', icon: 'paste' });
  }

  public canExecute(): boolean {
    return this.appStore.clipboard.canPaste;
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error('Буфер обмена пуст');
    }

    this.logAction(EventType.EDIT_ACTION, { action: 'paste' });
    this.appStore.clipboard.paste();
  }
}

