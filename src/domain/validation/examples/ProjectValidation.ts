import { 
  ValidationService,
  ValidationRule,
  ValidationResult,
  RuleConfig
} from '../index';

/**
 * Project validation example
 */
export interface ProjectData {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  manager?: string;
}

/**
 * Project validation rules configuration
 */
export const PROJECT_VALIDATION_RULES: RuleConfig[] = [
  {
    type: 'required',
    params: { ruleName: 'nameRequired' },
    message: 'Project name is required'
  },
  {
    type: 'minLength',
    params: { minLength: 3, ruleName: 'nameMinLength' },
    message: 'Project name must be at least 3 characters'
  },
  {
    type: 'maxLength',
    params: { maxLength: 100, ruleName: 'nameMaxLength' },
    message: 'Project name must not exceed 100 characters'
  },
  {
    type: 'custom',
    params: {
      ruleName: 'dateRange',
      validator: (value: ProjectData) => {
        const errors = [];
        const warnings = [];

        if (value.startDate && value.endDate && value.startDate >= value.endDate) {
          errors.push({
            field: 'endDate',
            code: 'INVALID_DATE_RANGE',
            message: 'End date must be after start date',
            severity: 'error'
          });
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      }
    }
  },
  {
    type: 'positive',
    params: { ruleName: 'budgetPositive' },
    message: 'Budget must be a positive number'
  }
];

/**
 * Validate project data
 */
export function validateProject(
  project: ProjectData,
  operation: 'create' | 'update' = 'create',
  userId?: string
): ValidationResult {
  const context = ValidationService.createContext(operation, userId, {
    entityType: 'project'
  });

  return ValidationService.validateWithConfig('project', project, PROJECT_VALIDATION_RULES, context);
}

/**
 * Quick project name validation
 */
export function validateProjectName(name: string): ValidationResult {
  const rules: RuleConfig[] = [
    {
      type: 'required',
      params: { ruleName: 'nameRequired' }
    },
    {
      type: 'minLength',
      params: { minLength: 3, ruleName: 'nameMinLength' }
    },
    {
      type: 'maxLength',
      params: { maxLength: 100, ruleName: 'nameMaxLength' }
    }
  ];

  return ValidationService.validateWithConfig('project', { name }, rules);
}
