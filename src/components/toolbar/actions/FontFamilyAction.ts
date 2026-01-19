import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для изменения семейства шрифта
 * Кнопка форматирования TF005
 */
export class FontFamilyAction extends ToolbarAction {
  private currentFont: string = 'Arial';
  private readonly fonts: string[] = [
    'Arial',
    'Calibri',
    'Times New Roman',
    'Helvetica',
    'Verdana',
    'Georgia',
    'Courier New',
    'Tahoma',
    'Trebuchet MS',
    'Impact'
  ];

  constructor() {
    super('TF005', 'Шрифт', 'Font', 'Изменить семейство шрифта');
  }

  /**
   * Устанавливает семейство шрифта
   */
  execute(fontFamily?: string): void {
    if (fontFamily && this.fonts.includes(fontFamily)) {
      this.currentFont = fontFamily;
    }
    console.log(`Семейство шрифта: ${this.currentFont}`);
    // TODO: Интеграция с TextFormatter или FontManager
  }

  /**
   * Возвращает текущее семейство шрифта
   */
  getCurrentFont(): string {
    return this.currentFont;
  }

  /**
   * Возвращает доступные семейства шрифтов
   */
  getAvailableFonts(): string[] {
    return [...this.fonts];
  }

  /**
   * Создаёт экземпляр кнопки для тулбара с dropdown
   */
  createButton(): IToolbarButton {
    const dropdownItems = this.fonts.map(font => ({
      id: `${this.id}-${font.replace(/\s+/g, '')}`,
      label: font,
      icon: font === this.currentFont ? '✓' : '',
      onClick: () => this.execute(font)
    }));

    return {
      id: this.id,
      label: this.currentFont,
      icon: this.icon,
      tooltip: this.tooltip,
      disabled: this.disabled,
      dropdownItems,
      onClick: () => {
        // Показать dropdown меню
        console.log('Показать меню выбора шрифта');
      }
    };
  }
}

