import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Утилита для объединения CSS классов
 * Использует clsx и tailwind-merge для оптимального результата
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

