import { useState, useCallback } from 'react';

import type { JsonObject } from '@/types/json-types';

/**
 * Типы значений для валидации
 * Включает все примитивные типы, массивы строк и JSON объекты
 */
export type ValidationValue = string | number | boolean | string[] | JsonObject | null | undefined;

/**
 * Правило валидации поля (экспорт для useDialogForm)
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  /** Кастомная функция валидации. Возвращает null если валидно, иначе сообщение об ошибке */
  custom?: (value: ValidationValue) => string | null;
  /** @deprecated Используйте custom вместо validate */
  validate?: (value: ValidationValue) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string | null;
}

export const useDialogValidation = (rules: ValidationRules = {}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((fieldName: string, value: ValidationValue): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Это поле обязательно для заполнения';
    }

    if (rule.minLength && value !== null && value !== undefined) {
      if (typeof value === 'string' && value.length < rule.minLength) {
        return `Минимальная длина: ${rule.minLength} символов`;
      }
      if (Array.isArray(value) && value.length < rule.minLength) {
        return `Минимальное количество элементов: ${rule.minLength}`;
      }
    }

    if (rule.maxLength && value !== null && value !== undefined) {
      if (typeof value === 'string' && value.length > rule.maxLength) {
        return `Максимальная длина: ${rule.maxLength} символов`;
      }
      if (Array.isArray(value) && value.length > rule.maxLength) {
        return `Максимальное количество элементов: ${rule.maxLength}`;
      }
    }

    if (rule.min !== undefined && value !== null && value !== undefined) {
      if (Number(value) < rule.min) {
        return `Минимальное значение: ${rule.min}`;
      }
    }

    if (rule.max !== undefined && value !== null && value !== undefined) {
      if (Number(value) > rule.max) {
        return `Максимальное значение: ${rule.max}`;
      }
    }

    if (rule.pattern && value && typeof value === 'string' && !rule.pattern.test(value)) {
      return 'Неверный формат';
    }

    // Поддержка custom и legacy validate
    const customValidator = rule.custom || rule.validate;
    if (customValidator) {
      return customValidator(value);
    }

    return null;
  }, [rules]);

  const validate = useCallback((formDataOrField: Record<string, ValidationValue> | string, value?: ValidationValue): boolean => {
    if (typeof formDataOrField === 'string') {
      const fieldName = formDataOrField;
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
      return !error;
    }

    const formData = formDataOrField;
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      newErrors[fieldName] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  }, []);

  const isValid = useCallback((): boolean => {
    return Object.keys(errors).every(key => !errors[key]);
  }, [errors]);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearError,
    isValid
  };
};

