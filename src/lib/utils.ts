import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Утилита для объединения CSS классов с помощью clsx и tailwind-merge
 * Следует принципу DRY и SOLID
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

