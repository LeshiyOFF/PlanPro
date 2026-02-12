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
   * GANTT-COLORS-FIX: Генерирует детерминированный цвет на основе ID
   * Использует улучшенный хеш (FNV-1a) для равномерного распределения по всему спектру
   */
  public static generateRainbowColor(seed: string): string {
    // FNV-1a хеш для лучшего распределения
    let hash = 2166136261 // FNV offset basis
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i)
      hash = Math.imul(hash, 16777619) // FNV prime
    }
    
    // Используем золотое сечение для равномерного распределения по спектру
    // Это гарантирует максимальное расстояние между последовательными цветами
    const goldenRatio = 0.618033988749895
    const normalizedHash = Math.abs(hash) / 0xFFFFFFFF
    const h = Math.round(((normalizedHash * goldenRatio) % 1) * 360)
    
    return `hsl(${h}, 70%, 50%)`
  }

  /**
   * Возвращает наиболее контрастный цвет текста (черный или белый) в формате Tailwind HSL
   * для заданного фонового HEX цвета.
   */
  public static getContrastForeground(hex: string): string {
    return this.isDark(hex) ? '0 0% 98%' : '0 0% 12%'
  }

  /**
   * GANTT-COLORS-FIX: Затемняет цвет на заданную величину
   * Поддерживает HEX и HSL форматы, а также 'transparent'
   * @param color - исходный цвет (HEX '#3b82f6', HSL 'hsl(200, 70%, 50%)', или 'transparent')
   * @param amount - величина затемнения от 0 до 1 (0.2 = 20% темнее)
   * @returns затемнённый HEX цвет
   */
  public static darken(color: string, amount: number): string {
    // Обработка специальных значений
    if (!color || color === 'transparent' || color === 'none') {
      return color
    }

    // Обработка HSL формата из generateRainbowColor
    if (color.startsWith('hsl(')) {
      const match = color.match(/hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\s*\)/)
      if (match) {
        const h = parseFloat(match[1])
        const s = parseFloat(match[2])
        const l = parseFloat(match[3])
        const newL = Math.max(0, l - (l * amount))
        return this.hslToHex(h, s, newL)
      }
    }

    // Стандартная обработка HEX
    const { h, s, l } = this.hexToHsl(color)
    const newL = Math.max(0, l - (l * amount))
    return this.hslToHex(h, s, newL)
  }

  /**
   * GANTT-COLORS-FIX: Осветляет цвет на заданную величину
   * Поддерживает HEX и HSL форматы, а также 'transparent'
   * @param color - исходный цвет (HEX '#1e40af', HSL 'hsl(200, 70%, 50%)', или 'transparent')
   * @param amount - величина осветления от 0 до 1 (0.2 = 20% светлее)
   * @returns осветлённый HEX цвет
   */
  public static lighten(color: string, amount: number): string {
    // Обработка специальных значений
    if (!color || color === 'transparent' || color === 'none') {
      return color
    }

    // Обработка HSL формата из generateRainbowColor
    if (color.startsWith('hsl(')) {
      const match = color.match(/hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\s*\)/)
      if (match) {
        const h = parseFloat(match[1])
        const s = parseFloat(match[2])
        const l = parseFloat(match[3])
        const newL = Math.min(100, l + ((100 - l) * amount))
        return this.hslToHex(h, s, newL)
      }
    }

    // Стандартная обработка HEX
    const { h, s, l } = this.hexToHsl(color)
    const newL = Math.min(100, l + ((100 - l) * amount))
    return this.hslToHex(h, s, newL)
  }

  /**
   * GANTT-COLORS: Конвертирует HSL в HEX формат
   * @param h - hue (0-360)
   * @param s - saturation (0-100)
   * @param l - lightness (0-100)
   * @returns HEX цвет (например, '#3b82f6')
   */
  public static hslToHex(h: number, s: number, l: number): string {
    // Нормализация значений
    s = s / 100
    l = l / 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2

    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x
    }

    // Конвертация в [0-255] и в HEX
    const toHex = (val: number) => {
      const hex = Math.round((val + m) * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
}

