/**
 * Правила валидации полей диалога проекта.
 * Single Responsibility: определение ValidationRule[] для ProjectDialog.
 */

import type { ValidationRule } from '@/types/dialog/DialogTypes'

export const projectDialogValidationRules: ValidationRule[] = [
  {
    field: 'name',
    required: true,
    minLength: 3,
    maxLength: 100,
    custom: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Название проекта обязательно'
      }
      if (value.trim().length < 3) {
        return 'Минимальная длина названия - 3 символа'
      }
      return true
    },
  },
  {
    field: 'manager',
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  {
    field: 'startDate',
    required: true,
    custom: (value: unknown) => {
      if (!value) {
        return 'Дата начала обязательна'
      }
      let dateValue: Date
      if (value && typeof value === 'object' && value !== null && 'getTime' in value && typeof (value as Date).getTime === 'function') {
        dateValue = value as Date
      } else if (typeof value === 'string' || typeof value === 'number') {
        dateValue = new Date(value)
      } else {
        return 'Неверный формат даты'
      }
      if (isNaN(dateValue.getTime())) {
        return 'Неверный формат даты'
      }
      if (dateValue > new Date()) {
        return 'Дата начала не может быть в будущем'
      }
      return true
    },
  },
]
