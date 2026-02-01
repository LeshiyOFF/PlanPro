/**
 * Интерфейс сервиса управления диалоговыми окнами
 * Следует SOLID принципам (Interface Segregation Principle)
 */

import { DialogType, DialogData, DialogResult } from '@/types/dialog/IDialogRegistry'

/**
 * Состояние диалога с типизацией
 */
export interface IDialogState<T extends DialogType> {
  readonly id: string;
  readonly type: T;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly data: DialogData<T>;
  readonly error: string | null;
}

/**
 * Конфигурация диалога
 */
export interface IDialogConfig {
  readonly width?: number;
  readonly height?: number;
  readonly modal: boolean;
  readonly resizable: boolean;
}

/**
 * Регистрационная информация диалога
 */
export interface IDialogRegistration<T extends DialogType> {
  readonly id: string;
  readonly type: T;
  readonly component: React.ComponentType<IDialogComponentProps<T>>;
  readonly config: IDialogConfig;
}

/**
 * Пропсы компонента диалога
 */
export interface IDialogComponentProps<T extends DialogType> {
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly data: DialogData<T>;
  readonly error: string | null;
  readonly onSubmit: (data: DialogData<T>) => Promise<DialogResult<T>>;
  readonly onCancel: () => void;
}

/**
 * Результат операции диалога
 */
export interface IDialogOperationResult<T extends DialogType> {
  readonly success: boolean;
  readonly result?: DialogResult<T>;
  readonly error?: string;
}

/**
 * Интерфейс сервиса управления диалогами
 */
export interface IDialogService {
  /**
   * Регистрация диалога в системе
   */
  register<T extends DialogType>(
    registration: IDialogRegistration<T>
  ): void;

  /**
   * Открытие диалога с типизированными данными
   */
  open<T extends DialogType>(
    type: T,
    data: DialogData<T>,
    config?: Partial<IDialogConfig>
  ): Promise<IDialogOperationResult<T>>;

  /**
   * Закрытие активного диалога
   */
  close<T extends DialogType>(
    type: T,
    result?: DialogResult<T>
  ): void;

  /**
   * Получение состояния диалога
   */
  getState<T extends DialogType>(type: T): IDialogState<T> | null;

  /**
   * Проверка открыт ли диалог
   */
  isOpen(type: DialogType): boolean;

  /**
   * Закрытие всех диалогов
   */
  closeAll(): void;

  /**
   * Подписка на изменения состояния
   */
  subscribe(listener: () => void): () => void;
}
