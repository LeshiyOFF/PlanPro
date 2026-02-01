import type { StrictData } from '@/types/Master_Functionality_Catalog'
import { EventType } from '@/types/Master_Functionality_Catalog'
import { logger } from '@/utils/logger'

/**
 * Базовый интерфейс для всех Action классов
 * Следует SOLID принципу Interface Segregation
 */
export interface IAction {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly shortcut?: string;
  readonly icon?: string;
  readonly enabled: boolean;
  execute(): Promise<void>;
  canExecute(): boolean;
}

/**
 * Базовый абстрактный класс для всех Action
 * Реализует общую функциональность для всех Action
 */
export abstract class BaseAction implements IAction {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly description: string;
  public readonly shortcut?: string
  public readonly icon?: string

  constructor(options?: { shortcut?: string; icon?: string }) {
    this.shortcut = options?.shortcut
    this.icon = options?.icon
  }

  public get enabled(): boolean {
    return this.canExecute()
  }

  public abstract execute(): Promise<void>;
  public abstract canExecute(): boolean;

  /**
   * Логирование выполнения действия (данные передаются как StrictData)
   */
  protected logAction(_type: EventType, data?: Record<string, string | number | boolean>): void {
    logger.info(`Action executed: ${this.name}`, (data ?? {}) as StrictData)
  }
}

