/**
 * Organism Form - комплексная форма с валидацией
 * Следует SOLID принципам и Atomic Design
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { AtomButton, AtomBadge } from '../atoms';
import { FormField, Card } from '../molecules';
import { BaseAtomicProps, ColorVariant } from '../atoms/types';

/**
 * Типы для Form
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
  };
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string | null;
}

/**
 * Props для Form Organism
 */
export interface FormProps extends BaseAtomicProps {
  fields: FormField[];
  initialData?: FormData;
  onSubmit?: (data: FormData) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  submitColor?: ColorVariant;
  title?: string;
  description?: string;
  validationMode?: 'onChange' | 'onSubmit';
}

/**
 * Form (Organism)
 * Сложный компонент формы с валидацией
 */
export const Form: React.FC<FormProps> = ({
  className = '',
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  submitColor = 'primary',
  title,
  description,
  validationMode = 'onChange',
  testId
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((field: FormField, value: any): string | null => {
    if (!field.validation) return null;

    const { validation } = field;

    // Required validation
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (!value) return null;

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(String(value))) {
      return `${field.label} format is invalid`;
    }

    // Length validation
    if (validation.minLength && String(value).length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && String(value).length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    // Number validation
    if (validation.min && Number(value) < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }

    if (validation.max && Number(value) > validation.max) {
      return `${field.label} must be no more than ${validation.max}`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }, []);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);

    if (validationMode === 'onChange') {
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  }, [formData, fields, validateField, validationMode]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid && onSubmit) {
      await onSubmit(formData);
    }
  }, [formData, fields, validateField, onSubmit]);

  const handleCancel = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    onCancel?.();
  }, [initialData, onCancel]);

  const renderField = useCallback((field: FormField) => {
    const error = errors[field.name];
    
    if (field.type === 'select') {
      return (
        <select
          value={formData[field.name] || ''}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select {field.label}</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          placeholder={field.placeholder}
          value={formData[field.name] || ''}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <AtomInput
        type={field.type}
        placeholder={field.placeholder}
        value={formData[field.name] || ''}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        error={!!error}
        helperText={error}
        required={field.required}
      />
    );
  }, [formData, errors, handleFieldChange]);

  const formClasses = cn(
    'space-y-6',
    className
  );

  return (
    <Card className={formClasses} data-testid={testId}>
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-1 text-gray-600">{description}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => (
          <FormField
            key={field.name}
            label={field.label}
            inputProps={{
              type: field.type,
              placeholder: field.placeholder,
              required: field.required,
              defaultValue: field.defaultValue
            }}
            error={errors[field.name]}
            required={field.required}
          >
            {renderField(field)}
          </FormField>
        ))}

        <div className="flex justify-end space-x-3 pt-6">
          {onCancel && (
            <AtomButton
              type="button"
              variant="outline"
              color="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </AtomButton>
          )}
          
          <AtomButton
            type="submit"
            color={submitColor}
            disabled={loading}
          >
            {loading ? 'Saving...' : submitText}
          </AtomButton>
        </div>
      </form>
    </Card>
  );
};

