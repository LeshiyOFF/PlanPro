import { useState, useCallback } from 'react';
import { useDialogValidation, type ValidationRule, type ValidationValue } from './useDialogValidation';
import type { JsonObject } from '@/types/json-types';

/** Допустимое значение поля формы (примитив или вложенный объект для вложенных форм) */
export type FormFieldValue = ValidationValue | JsonObject;

interface UseDialogFormOptions<T> {
  initialData: T;
  validationRules?: Record<string, ValidationRule>;
}

export const useDialogForm = <T extends Record<string, FormFieldValue>>({
  initialData,
  validationRules = {}
}: UseDialogFormOptions<T>) => {
  const [dialogData, setDialogData] = useState<T>(initialData);
  const { validate, validateField, clearErrors, errors } = useDialogValidation(validationRules);

  const handleFieldChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setDialogData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку для этого поля при изменении
    if (errors[field as string]) {
      validateField(field as string, value);
    }
  }, [errors, validateField]);

  const resetForm = useCallback(() => {
    setDialogData(initialData);
    clearErrors();
  }, [initialData, clearErrors]);

  const updateFormData = useCallback((updates: Partial<T>) => {
    setDialogData(prev => ({ ...prev, ...updates }));
  }, []);

  const isFormValid = validate(dialogData);

  return {
    dialogData,
    setDialogData,
    handleFieldChange,
    resetForm,
    updateFormData,
    errors,
    isFormValid,
    validate,
    validateField
  };
};

