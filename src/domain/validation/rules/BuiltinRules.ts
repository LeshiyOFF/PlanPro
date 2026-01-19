import { 
  ValidationRule, 
  ValidationError, 
  ValidationResult,
  RuleConfig 
} from '../interfaces/ValidationRule';

/**
 * Required field validation rule
 */
export class RequiredRule<T = any> implements ValidationRule<T> {
  name = 'required';

  validate(value: T): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'REQUIRED',
          message: 'Field is required',
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Minimum length validation rule
 */
export class MinLengthRule implements ValidationRule<string> {
  name = 'minLength';
  private minLength: number;

  constructor(minLength: number) {
    this.minLength = minLength;
  }

  validate(value: string): ValidationResult {
    if (value && value.length < this.minLength) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'MIN_LENGTH',
          message: `Minimum length is ${this.minLength}`,
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Maximum length validation rule
 */
export class MaxLengthRule implements ValidationRule<string> {
  name = 'maxLength';
  private maxLength: number;

  constructor(maxLength: number) {
    this.maxLength = maxLength;
  }

  validate(value: string): ValidationResult {
    if (value && value.length > this.maxLength) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'MAX_LENGTH',
          message: `Maximum length is ${this.maxLength}`,
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Email validation rule
 */
export class EmailRule implements ValidationRule<string> {
  name = 'email';
  private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validate(value: string): ValidationResult {
    if (value && !this.emailPattern.test(value)) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'INVALID_EMAIL',
          message: 'Invalid email format',
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Numeric validation rule
 */
export class NumericRule implements ValidationRule<string | number> {
  name = 'numeric';

  validate(value: string | number): ValidationResult {
    const strValue = String(value).trim();
    
    if (strValue && !/^-?\d*\.?\d+$/.test(strValue)) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'NOT_NUMERIC',
          message: 'Value must be numeric',
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Positive number validation rule
 */
export class PositiveRule implements ValidationRule<string | number> {
  name = 'positive';

  validate(value: string | number): ValidationResult {
    const numValue = Number(value);
    
    if (value && (isNaN(numValue) || numValue <= 0)) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'NOT_POSITIVE',
          message: 'Value must be positive',
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Range validation rule
 */
export class RangeRule implements ValidationRule<string | number> {
  name = 'range';
  private min: number;
  private max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  validate(value: string | number): ValidationResult {
    const numValue = Number(value);
    
    if (value && (isNaN(numValue) || numValue < this.min || numValue > this.max)) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'OUT_OF_RANGE',
          message: `Value must be between ${this.min} and ${this.max}`,
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Pattern validation rule
 */
export class PatternRule implements ValidationRule<string> {
  name = 'pattern';
  private pattern: RegExp;
  private errorMessage: string;

  constructor(pattern: RegExp, errorMessage: string) {
    this.pattern = pattern;
    this.errorMessage = errorMessage;
  }

  validate(value: string): ValidationResult {
    if (value && !this.pattern.test(value)) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'PATTERN_MISMATCH',
          message: this.errorMessage,
          severity: 'error'
        }],
        warnings: []
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

/**
 * Custom validation rule
 */
export class CustomRule<T = any> implements ValidationRule<T> {
  name = 'custom';
  private validator: (value: T) => ValidationResult;
  private ruleName: string;

  constructor(name: string, validator: (value: T) => ValidationResult) {
    this.ruleName = name;
    this.validator = validator;
  }

  validate(value: T): ValidationResult {
    try {
      return this.validator(value);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          field: 'value',
          code: 'CUSTOM_VALIDATION_ERROR',
          message: `Custom validation failed: ${this.ruleName}`,
          severity: 'error'
        }],
        warnings: []
      };
    }
  }
}

