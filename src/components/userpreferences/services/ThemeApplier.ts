import { ColorUtils } from '@/utils/ColorUtils';
import { APP_FONTS } from '../constants/FontConstants';

/**
 * Класс для применения свойств темы к DOM элементам
 * Инкапсулирует работу с CSS-переменными
 * Соответствует принципу Single Responsibility Principle
 * 
 * Внедрена Dynamic Accent System для эталонного дизайна 2026.
 */
export class ThemeApplier {
  private static readonly ROOT_SELECTOR = ':root';
  private static readonly DARK_SELECTOR = '.dark';

  /**
   * Применяет акцентный цвет к корневому элементу приложения
   * Создаёт полный спектр CSS-переменных для профессионального дизайна
   */
  public static applyAccentColor(hexColor: string): void {
    const hslValue = ColorUtils.hexToTailwindHsl(hexColor);
    const accentHsl = ColorUtils.getLightAccentHsl(hexColor);
    const isDark = ColorUtils.isDark(hexColor);
    
    // Автоматический расчет цвета текста для кнопок (Accessibility)
    const primaryForegroundHsl = ColorUtils.getContrastForeground(hexColor);
    
    const hslComponents = ColorUtils['hexToHsl'](hexColor);
    const h = Math.round(hslComponents.h);
    const s = Math.round(hslComponents.s);
    
    // Основные переменные
    document.documentElement.style.setProperty('--primary-hex', hexColor);
    document.documentElement.style.setProperty('--primary', hslValue);
    document.documentElement.style.setProperty('--primary-foreground', primaryForegroundHsl);
    document.documentElement.style.setProperty('--ring', hslValue);

    // Синхронизация акцента (для вкладок, ховеров и боковой панели)
    const accentForegroundHsl = isDark ? hslValue : '0 0% 12%';
    document.documentElement.style.setProperty('--accent', accentHsl);
    document.documentElement.style.setProperty('--accent-foreground', accentForegroundHsl);

    // Эталонные оттенки для рамок и деликатных фонов
    // Ограничиваем насыщенность (Saturation) для рамок до 15%, чтобы они были мягкими
    const softSaturation = Math.min(s, 15);
    document.documentElement.style.setProperty('--primary-border', `${h} ${softSaturation}% 88%`);
    document.documentElement.style.setProperty('--primary-soft', `${h} ${softSaturation}% 94%`);
    document.documentElement.style.setProperty('--primary-muted', `${h} ${softSaturation}% 96%`);
    
    // Тени с акцентным цветом
    document.documentElement.style.setProperty('--primary-shadow-light', `${h} ${s}% 70%`);
    document.documentElement.style.setProperty('--primary-shadow', `${h} ${s}% 50%`);
    
    // Hover-состояния
    document.documentElement.style.setProperty('--primary-hover', `${h} ${Math.min(s + 5, 100)}% ${isDark ? '30%' : '45%'}`);
    
    // Синхронизация стандартных border-переменных с акцентным цветом
    // Используем экстремально приглушённый оттенок (Saturation 6%, Lightness 95%)
    // Это превращает "жёсткие" линии в элегантную "воздушную" сетку
    const borderSat = Math.min(s, 6);
    if (isDark) {
      document.documentElement.style.setProperty('--border', `${h} ${borderSat}% 25%`);
      document.documentElement.style.setProperty('--input', `${h} ${borderSat}% 25%`);
    } else {
      document.documentElement.style.setProperty('--border', `${h} ${borderSat}% 95%`);
      document.documentElement.style.setProperty('--input', `${h} ${borderSat}% 95%`);
    }
  }

  /**
   * Применяет размер шрифта к корневому элементу приложения
   */
  public static applyFontSize(size: number): void {
    if (size > 0) {
      document.documentElement.style.setProperty('--app-font-size', `${size}px`);
    }
  }

  /**
   * Применяет семейство шрифтов к корневому элементу приложения
   */
  public static applyFontFamily(font: string): void {
    if (!font) return;

    const fontOption = APP_FONTS.find(f => f.value === font);
    const fontStack = fontOption ? fontOption.stack : `'${font}', sans-serif`;
    
    document.documentElement.style.setProperty('--app-font-family', fontStack);
  }

  /**
   * Применяет настройки анимации
   */
  public static applyAnimations(enabled: boolean): void {
    if (enabled) {
      document.documentElement.classList.remove('disable-animations');
    } else {
      document.documentElement.classList.add('disable-animations');
    }
  }

  /**
   * Применяет режим высокой контрастности
   */
  public static applyHighContrast(enabled: boolean): void {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }

  /**
   * Получает текущий акцентный цвет в формате HEX
   */
  public static getCurrentAccentHex(): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-hex').trim() || '#1F1F1F';
  }
}

