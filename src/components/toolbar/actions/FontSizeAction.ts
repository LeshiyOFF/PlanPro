import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';
import { textFormattingService } from '@/services/TextFormattingService';

/**
 * Действие для изменения размера шрифта
 * Кнопка форматирования TF004
 */
export class FontSizeAction extends ToolbarAction {
  private readonly sizes: number[] = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

  constructor() {
    super('TF004', 'Размер шрифта', 'Aa', 'Изменить размер шрифта');
  }

  /**
   * Выполняет действие (IAction). Открытие выбора размера — в createButton.
   */
  override async execute(): Promise<void> {
    // Базовый вызов без аргумента; выбор размера через UI кнопки
  }

  /**
   * Устанавливает размер шрифта
   */
  setSize(size: number): void {
    if (this.sizes.includes(size)) {
      textFormattingService.setFontSize(size);
    }
  }

  /**
   * Возвращает текущий размер шрифта
   */
  getCurrentSize(): number {
    return textFormattingService.getFontSize();
  }

  /**
   * Возвращает доступные размеры шрифтов
   */
  getAvailableSizes(): number[] {
    return [...this.sizes];
  }

  /**
   * Создаёт экземпляр кнопки для тулбара с dropdown
   */
  createButton(): IToolbarButton {
    const currentSize = this.getCurrentSize();
    const dropdownItems = this.sizes.map(size => ({
      id: `${this.id}-${size}`,
      label: `${size}pt`,
      icon: size === currentSize ? '✓' : '',
      onClick: () => this.setSize(size)
    }));

    return {
      id: this.id,
      label: `${currentSize}pt`,
      icon: this.icon,
      tooltip: this.tooltip,
      disabled: this.disabled,
      dropdownItems,
      onClick: () => {
        console.log('Показать меню выбора размера шрифта');
      }
    };
  }
}

