import { 
  ValidationRegistry, 
  ValidationRule, 
  ValidationContext, 
  ValidationResult,
  RuleConfig,
  BuiltinRuleType 
} from '../interfaces/ValidationRule';
import { 
  RequiredRule,
  MinLengthRule,
  MaxLengthRule,
  EmailRule,
  NumericRule,
  PositiveRule,
  RangeRule,
  PatternRule,
  CustomRule
} from '../rules/BuiltinRules';
import { ValidationRegistryImpl } from './ValidationEngine';

/**
 * Validation service factory
 */
export class ValidationService {
  private static registries: Map<string, ValidationRegistry<any>> = new Map();

  /**
   * Get or create validation registry for entity type
   */
  static getRegistry<T = any>(entityType: string): ValidationRegistry<T> {
    if (!this.registries.has(entityType)) {
      this.registries.set(entityType, new ValidationRegistryImpl<T>());
    }
    return this.registries.get(entityType) as ValidationRegistry<T>;
  }

  /**
   * Create built-in validation rule from configuration
   */
  static createRule<T = any>(config: RuleConfig): ValidationRule<T> {
    switch (config.type) {
      case 'required':
        return new RequiredRule<T>();
      
      case 'minLength':
        return new MinLengthRule(config.params?.minLength || 0) as ValidationRule<T>;
      
      case 'maxLength':
        return new MaxLengthRule(config.params?.maxLength || 999999) as ValidationRule<T>;
      
      case 'email':
        return new EmailRule() as ValidationRule<T>;
      
      case 'numeric':
        return new NumericRule() as ValidationRule<T>;
      
      case 'positive':
        return new PositiveRule() as ValidationRule<T>;
      
      case 'range':
        return new RangeRule(
          config.params?.min || 0,
          config.params?.max || 999999
        ) as ValidationRule<T>;
      
      case 'pattern':
        return new PatternRule(
          config.params?.pattern || /.*/,
          config.message || 'Invalid format'
        ) as ValidationRule<T>;
      
      case 'custom':
        return new CustomRule(
          config.params?.ruleName || 'custom',
          config.params?.validator || (() => ({ isValid: true, errors: [], warnings: [] }))
        ) as ValidationRule<T>;
      
      default:
        throw new Error(`Unknown validation rule type: ${config.type}`);
    }
  }

  /**
   * Create validation context
   */
  static createContext(
    operation: 'create' | 'update' | 'delete',
    userId?: string,
    metadata?: Record<string, any>
  ): ValidationContext {
    return {
      operation,
      userId,
      timestamp: new Date(),
      metadata
    };
  }

  /**
   * Validate entity using rules configuration
   */
  static validateWithConfig<T = any>(
    entityType: string,
    value: T,
    configs: RuleConfig[],
    context?: ValidationContext
  ): ValidationResult {
    const registry = this.getRegistry<T>(entityType);
    const rules: ValidationRule<T>[] = [];

    for (const config of configs) {
      const rule = this.createRule<T>(config);
      rule.name = config.params?.ruleName || config.type;
      registry.registerRule(rule);
      rules.push(rule);
    }

    return registry.validate(value, undefined, context);
  }

  /**
   * Validate with rule names
   */
  static validateWithRules<T = any>(
    entityType: string,
    value: T,
    ruleNames: string[],
    context?: ValidationContext
  ): ValidationResult {
    const registry = this.getRegistry<T>(entityType);
    return registry.validate(value, ruleNames, context);
  }

  /**
   * Get all registered rules for entity type
   */
  static getRules<T = any>(entityType: string): ValidationRule<T>[] {
    const registry = this.getRegistry<T>(entityType);
    return registry.getRules();
  }

  /**
   * Register custom rule for entity type
   */
  static registerRule<T = any>(
    entityType: string,
    rule: ValidationRule<T>
  ): void {
    const registry = this.getRegistry<T>(entityType);
    registry.registerRule(rule);
  }

  /**
   * Unregister rule for entity type
   */
  static unregisterRule(entityType: string, ruleName: string): void {
    const registry = this.getRegistry(entityType);
    registry.unregisterRule(ruleName);
  }
}

