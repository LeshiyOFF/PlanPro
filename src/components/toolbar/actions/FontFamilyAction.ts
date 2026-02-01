import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';
import { textFormattingService } from '@/services/TextFormattingService';

/**
 * Действие для изменения семейства шрифта
 * Кнопка форматирования TF005
 */
export class FontFamilyAction extends ToolbarAction {
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
   * Выполняет действие (IAction). Выбор шрифта — в createButton.
   */
  override async execute(): Promise<void> {
    // Базовый вызов без аргумента; выбор шрифта через UI кнопки
  }

  /**
   * Устанавливает семейство шрифта
   */
  setFontFamily(fontFamily: string): void {
    if (fontFamily && this.fonts.includes(fontFamily)) {
      textFormattingService.setFontFamily(fontFamily);
    }
  }

  /**
   * Возвращает текущее семейство шрифта
   */
  getCurrentFont(): string {
    return textFormattingService.getFontFamily();
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
    const currentFont = this.getCurrentFont();
    const dropdownItems = this.fonts.map(font => ({
      id: `${this.id}-${font.replace(/\s+/g, '')}`,
      label: font,
      icon: font === currentFont ? '✓' : '',
      onClick: () => this.setFontFamily(font)
    }));

    return {
      id: this.id,
      label: currentFont,
      icon: this.icon,
      tooltip: this.tooltip,
      disabled: this.disabled,
      dropdownItems,
      onClick: () => {
        console.log('Показать меню выбора шрифта');
      }
    };
  }
}

