/**
 * Интерфейсы для Status Bar системы
 * Следует SOLID принципам и Clean Architecture
 */

/**
 * Тип сообщения статусбара
 */
export type StatusBarMessageType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'progress';

/**
 * Интерфейс сообщения статусбара
 */
export interface IStatusBarMessage {
  id: string;
  type: StatusBarMessageType;
  text: string;
  timestamp: Date;
  timeout?: number;
  persistent?: boolean;
}

/**
 * Интерфейс секции статусбара
 */
export interface IStatusBarSection {
  id: string;
  order: number;
  visible: boolean;
  content: React.ReactNode;
  className?: string;
}

/**
 * Интерфейс состояния статусбара
 */
export interface IStatusBarState {
  sections: Map<string, IStatusBarSection>;
  message: IStatusBarMessage | null;
  isVisible: boolean;
  zoom: number;
  selection: string;
  ready: boolean;
}

/**
 * Интерфейс конфигурации статусбара
 */
export interface IStatusBarConfig {
  visible: boolean;
  showMessageTimeout: number;
  enableZoom: boolean;
  enableSelection: boolean;
  enableReady: boolean;
}

/**
 * Интерфейс контейнера статусбара
 */
export interface IStatusBarContainer {
  className?: string;
  config?: Partial<IStatusBarConfig>;
  onSectionClick?: (sectionId: string) => void;
}

/**
 * События статусбара
 */
export interface IStatusBarEvents {
  onMessageShow?: (message: IStatusBarMessage) => void;
  onMessageHide?: (messageId: string) => void;
  onSectionUpdate?: (sectionId: string, section: IStatusBarSection) => void;
  onZoomChange?: (zoom: number) => void;
  onSelectionChange?: (selection: string) => void;
}

/**
 * Сервис статусбара
 */
export interface IStatusBarService {
  showMessage(text: string, type?: StatusBarMessageType, timeout?: number): void;
  showWarning(text: string): void;
  showError(text: string): void;
  showSuccess(text: string): void;
  showProgress(text: string): void;
  clearMessage(): void;
  updateZoom(zoom: number): void;
  updateSelection(selection: string): void;
  setReady(ready: boolean): void;
  addSection(section: IStatusBarSection): void;
  removeSection(sectionId: string): void;
  toggleVisibility(): void;
  isVisible(): boolean;
}

/**
 * Props для компонента StatusBar
 */
export interface IStatusBarProps extends IStatusBarContainer {
  state?: IStatusBarState;
  events?: IStatusBarEvents;
}

/**
 * Тип позиции элемента в статусбаре
 */
export type StatusBarSectionPosition =
  | 'left'
  | 'center'
  | 'right';

/**
 * Конфигурация секции
 */
export interface IStatusBarSectionConfig {
  id: string;
  position: StatusBarSectionPosition;
  order: number;
  visible?: boolean;
  className?: string;
}

