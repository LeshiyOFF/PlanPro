import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для изменения размера шрифта
 * Кнопка форматирования TF004
 */
export class FontSizeAction extends ToolbarAction {
  private currentSize: number = 12;
  private readonly sizes: number[] = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

  constructor() {
    super('TF004', 'Размер шрифта', 'Aa', 'Изменить размер шрифта');
  }

  /**
   * Устанавливает размер шрифта
   */
  execute(size?: number): void {
    if (size !== undefined && this.sizes.includes(size)) {
      this.currentSize = size;
    }
    console.log(`Размер шрифта: ${this.currentSize}`);
    // TODO: Интеграция с TextFormatter или FontManager
  }

  /**
   * Возвращает текущий размер шрифта
   */
  getCurrentSize(): number {
    return this.currentSize;
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
    const dropdownItems = this.sizes.map(size => ({
      id: `${this.id}-${size}`,
      label: `${size}pt`,
      icon: size === this.currentSize ? '✓' : '',
      onClick: () => this.execute(size)
    }));

    return {
      id: this.id,
      label: `${this.currentSize}pt`,
      icon: this.icon,
      tooltip: this.tooltip,
      disabled: this.disabled,
      dropdownItems,
      onClick: () => {
        // Показать dropdown меню
        console.log('Показать меню выбора размера шрифта');
      }
    };
  }
}
