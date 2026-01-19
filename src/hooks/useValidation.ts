import { useState, useCallback, useEffect } from 'react';
import { 
  ValidationResult, 
  ValidationContext, 
  ValidationRule 
} from '@/domain/validation';
import { ValidationService } from '@/domain/validation';
import { logger } from '@/utils/logger';

/**
 * Validation hook interface
 */
export interface UseValidationReturn<T> {
  value: T;
  errors: string[];
  warnings: string[];
  isValid: boolean;
  setValue: (value: T) => void;
  validate: () => ValidationResult;
  clearErrors: () => void;
}

/**
 * Validation hook configuration
 */
export interface UseValidationConfig<T> {
  initialValue: T;
  entityType: string;
  rules?: ValidationRule<T>[];
  context?: ValidationContext;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Generic validation hook
 */
export function useValidation<T = any>(
  config: UseValidationConfig<T>
): UseValidationReturn<T> {
  const [value, setValue] = useState<T>(config.initialValue);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);

  const validate = useCallback((): ValidationResult => {
    try {
      if (config.rules && config.rules.length > 0) {
        const context = config.context || ValidationService.createContext('update');
        const result = ValidationService.validateWithRules(config.entityType, value, config.rules.map(r => r.name), context);
        
        setErrors(result.errors.map(e => e.message));
        setWarnings(result.warnings.map(w => w.message));
        setIsValid(result.isValid);
        
        return result;
      } else {
        setErrors([]);
        setWarnings([]);
        setIsValid(true);
        
        return {
          isValid: true,
          errors: [],
          warnings: []
        };
      }
    } catch (error) {
      logger.error('Validation failed', error, 'useValidation');
      setErrors(['Validation error occurred']);
      setWarnings([]);
      setIsValid(false);
      
      return {
        isValid: false,
        errors: [{ field: 'system', code: 'VALIDATION_ERROR', message: 'Validation error occurred', severity: 'error' }],
        warnings: []
      };
    }
  }, [value, config.rules, config.entityType, config.context]);

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    
    if (config.validateOnChange !== false) {
      setTimeout(validate, 0);
    }
  }, [validate, config.validateOnChange]);

  const handleBlur = useCallback(() => {
    if (config.validateOnBlur !== false) {
      validate();
    }
  }, [validate, config.validateOnBlur]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setWarnings([]);
    setIsValid(true);
  }, []);

  useEffect(() => {
    if (config.validateOnBlur === false && config.validateOnChange !== false) {
      validate();
    }
  }, []);

  return {
    value,
    errors,
    warnings,
    isValid,
    setValue: handleChange,
    validate,
    clearErrors
  };
}

/**
 * Simple field validation hook
 */
export function useFieldValidation<T = any>(
  initialValue: T,
  entityType: string,
  ruleName: string
): UseValidationReturn<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);

  const validate = useCallback((): ValidationResult => {
    try {
      const context = ValidationService.createContext('update');
      const result = ValidationService.validateWithRules(entityType, value, [ruleName], context);
      
      setErrors(result.errors.map(e => e.message));
      setWarnings(result.warnings.map(w => w.message));
      setIsValid(result.isValid);
      
      return result;
    } catch (error) {
      logger.error('Field validation failed', error, 'useFieldValidation');
      setErrors(['Validation error occurred']);
      setWarnings([]);
      setIsValid(false);
      
      return {
        isValid: false,
        errors: [{ field: 'system', code: 'VALIDATION_ERROR', message: 'Validation error occurred', severity: 'error' }],
        warnings: []
      };
    }
  }, [value, entityType, ruleName]);

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    setTimeout(validate, 0);
  }, [validate]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setWarnings([]);
    setIsValid(true);
  }, []);

  return {
    value,
    errors,
    warnings,
    isValid,
    setValue: handleChange,
    validate,
    clearErrors
  };
}
