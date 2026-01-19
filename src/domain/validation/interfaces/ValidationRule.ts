/**
 * Core validation interfaces following Clean Architecture principles
 * Provides generic validation framework for any domain entity
 */

/**
 * Base validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Single validation error
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
}

/**
 * Single validation warning
 */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

/**
 * Generic validation rule interface
 */
export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T, context?: ValidationContext) => ValidationResult;
}

/**
 * Validation context for additional data
 */
export interface ValidationContext {
  operation: 'create' | 'update' | 'delete';
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Composite validation rule
 */
export type CompositeValidationRule<T = any> = {
  name: string;
  validate: (value: T, context?: ValidationContext) => ValidationResult;
  rules: ValidationRule<T>[];
  strategy: 'all' | 'any' | 'stopOnFirst';
};


/**
 * Conditional validation rule
 */
export interface ConditionalValidationRule<T = any> extends ValidationRule<T> {
  condition: (value: T, context?: ValidationContext) => boolean;
  rule: ValidationRule<T>;
}

/**
 * Async validation rule interface
 */
export interface AsyncValidationRule<T = any> extends ValidationRule<T> {
  validate: (value: T, context?: ValidationContext) => Promise<ValidationResult>;
}

/**
 * Validation registry interface
 */
export interface ValidationRegistry<T = any> {
  registerRule: (rule: ValidationRule<T>) => void;
  unregisterRule: (ruleName: string) => void;
  validate: (value: T, ruleNames?: string[], context?: ValidationContext) => ValidationResult;
  getRules: () => ValidationRule<T>[];
}

/**
 * Validation strategy interface
 */
export interface ValidationStrategy<T = any> {
  execute: (value: T, rules: ValidationRule<T>[], context?: ValidationContext) => ValidationResult;
}

/**
 * Built-in validation rule types
 */
export type BuiltinRuleType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'email'
  | 'numeric'
  | 'positive'
  | 'range'
  | 'pattern'
  | 'custom';

/**
 * Rule configuration for built-in rules
 */
export interface RuleConfig {
  type: BuiltinRuleType;
  params?: Record<string, any>;
  message?: string;
  severity?: 'critical' | 'error' | 'warning';
}

