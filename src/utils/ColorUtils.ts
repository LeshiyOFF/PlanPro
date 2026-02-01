/**
 * Утилита для работы с цветами
 * Соответствует принципу Single Responsibility Principle
 */
export class ColorUtils {
  /**
   * Преобразует HEX цвет в формат HSL, используемый в Tailwind CSS переменных
   * Формат вывода: "H S% L%" (например, "0 0% 12%")
   */
  public static hexToTailwindHsl(hex: string): string {
    const { h, s, l } = this.hexToHsl(hex)
    return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`
  }

  /**
   * Преобразует HEX в HSL объект
   */
  private static hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Очистка hex от символа #
    let r = 0, g = 0, b = 0
    hex = hex.replace('#', '')

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16)
      g = parseInt(hex.substring(2, 4), 16)
      b = parseInt(hex.substring(4, 6), 16)
    }

    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100,
    }
  }

  /**
   * Возвращает очень светлую версию HSL (для фонов акцентов)
   */
  public static getLightAccentHsl(hex: string): string {
    const { h, s } = this.hexToHsl(hex)
    // Делаем цвет очень светлым (L=96%) для деликатной подсветки
    return `${Math.round(h)} ${Math.round(s)}% 96%`
  }

  /**
   * Определяет, является ли цвет темным
   * Используется для выбора контрастного цвета текста
   */
  public static isDark(hex: string): boolean {
    hex = hex.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    // Формула относительной яркости (YIQ)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq < 128
  }

  /**
   * Генерирует детерминированный цвет на основе ID
   */
  public static generateRainbowColor(seed: string): string {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    }
    const h = Math.abs(hash % 360)
    return `hsl(${h}, 70%, 50%)`
  }

  /**
   * Возвращает наиболее контрастный цвет текста (черный или белый) в формате Tailwind HSL
   * для заданного фонового HEX цвета.
   */
  public static getContrastForeground(hex: string): string {
    return this.isDark(hex) ? '0 0% 98%' : '0 0% 12%'
  }
}

