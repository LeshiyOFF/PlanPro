import { 
  ValidationResult, 
  ValidationRule, 
  ValidationContext, 
  ValidationStrategy,
  CompositeValidationRule,
  ConditionalValidationRule,
  ValidationRegistry,
  ValidationError,
  ValidationWarning
} from '../interfaces/ValidationRule';
import { logger } from '@/utils/logger';

/**
 * Default validation strategy
 */
export class DefaultValidationStrategy<T> implements ValidationStrategy<T> {
  execute(value: T, rules: ValidationRule<T>[], context?: ValidationContext): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      try {
        const result = rule.validate(value, context);
        
        if (!result.isValid) {
          errors.push(...result.errors);
          warnings.push(...result.warnings);
        }
      } catch (error) {
        logger.error(`Validation rule "${rule.name}" failed`, error, 'ValidationEngine');
        errors.push({
          field: 'unknown',
          code: 'RULE_ERROR',
          message: `Validation rule error: ${rule.name}`,
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Composite validation strategy
 */
export class CompositeValidationStrategy<T> implements ValidationStrategy<T> {
  execute(value: T, rules: ValidationRule<T>[], context?: ValidationContext): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      if ('rules' in rule && 'strategy' in rule) {
        const compositeRule = rule as CompositeValidationRule<T>;
        
        switch (compositeRule.strategy) {
          case 'all':
            for (const subRule of compositeRule.rules) {
              const result = subRule.validate(value, context);
              if (!result.isValid) {
                errors.push(...result.errors);
                warnings.push(...result.warnings);
              }
            }
            break;
            
          case 'any':
            let hasValid = false;
            for (const subRule of compositeRule.rules) {
              const result = subRule.validate(value, context);
              if (result.isValid) {
                hasValid = true;
                break;
              }
            }
            if (!hasValid) {
              errors.push({
                field: 'composite',
                code: 'NO_VALID_RULE',
                message: 'No validation rule passed in "any" strategy',
                severity: 'error'
              });
            }
            break;
            
          case 'stopOnFirst':
            for (const subRule of compositeRule.rules) {
              const result = subRule.validate(value, context);
              if (!result.isValid) {
                errors.push(...result.errors);
                warnings.push(...result.warnings);
                break;
              }
            }
            break;
        }
      } else {
        const result = rule.validate(value, context);
        if (!result.isValid) {
          errors.push(...result.errors);
          warnings.push(...result.warnings);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Validation registry implementation
 */
export class ValidationRegistryImpl<T> implements ValidationRegistry<T> {
  private rules: Map<string, ValidationRule<T>> = new Map();
  private strategy: ValidationStrategy<T>;

  constructor(strategy: ValidationStrategy<T> = new DefaultValidationStrategy()) {
    this.strategy = strategy;
  }

  registerRule(rule: ValidationRule<T>): void {
    if (this.rules.has(rule.name)) {
      logger.warning(`Validation rule "${rule.name}" already exists, overwriting`, {}, 'ValidationRegistry');
    }
    this.rules.set(rule.name, rule);
  }

  unregisterRule(ruleName: string): void {
    if (!this.rules.has(ruleName)) {
      logger.warning(`Validation rule "${ruleName}" not found`, {}, 'ValidationRegistry');
      return;
    }
    this.rules.delete(ruleName);
  }

  validate(value: T, ruleNames?: string[], context?: ValidationContext): ValidationResult {
    const rulesToExecute: ValidationRule<T>[] = [];

    if (ruleNames && ruleNames.length > 0) {
      for (const ruleName of ruleNames) {
        const rule = this.rules.get(ruleName);
        if (rule) {
          rulesToExecute.push(rule);
        } else {
          logger.warning(`Validation rule "${ruleName}" not found`, {}, 'ValidationRegistry');
        }
      }
    } else {
      rulesToExecute.push(...Array.from(this.rules.values()));
    }

    return this.strategy.execute(value, rulesToExecute, context);
  }

  getRules(): ValidationRule<T>[] {
    return Array.from(this.rules.values());
  }

  setStrategy(strategy: ValidationStrategy<T>): void {
    this.strategy = strategy;
  }
}

