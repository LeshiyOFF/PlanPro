import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string | null;
}

export const useDialogValidation = (rules: ValidationRules = {}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Это поле обязательно для заполнения';
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      return `Минимальная длина: ${rule.minLength} символов`;
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      return `Максимальная длина: ${rule.maxLength} символов`;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      return 'Неверный формат';
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validate = useCallback((formData: any): boolean => {
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

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearError,
    isValid: Object.keys(errors).every(key => !errors[key])
  };
};
