import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { JsonObject } from '@/types/json-types';

/**
 * Типы для значений форм
 */
export type FormFieldValue = string | number | boolean | Date | string[] | Record<string, JsonObject> | null;

/**
 * Опции для select полей
 */
export interface FormFieldOption {
  value: string;
  label: string;
}

/**
 * Props для FormField компонента
 */
export interface FormFieldProps {
  label: string;
  value: FormFieldValue;
  onChange: (value: FormFieldValue) => void;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Сообщение об ошибке (null не отображается) */
  error?: string | null;
  options?: FormFieldOption[];
  className?: string;
  /** Минимальное значение для type="number" (передаётся в input min) */
  min?: string;
  /** Максимальное значение для type="number" (передаётся в input max) */
  max?: string;
  /** Подсказка под полем */
  helper?: string;
}

/**
 * Компонент формы с типизацией
 * Соответствует SOLID и Clean Architecture
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  options = [],
  className = '',
  min,
  max,
  helper
}) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={typeof value === 'string' ? value : value != null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${error ? 'border-red-500' : ''} ${className}`}
          />
        );
      case 'select':
        return (
          <Select value={String(value)} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={`${error ? 'border-red-500' : ''} ${className}`}>
              {options.find(opt => opt.value === String(value))?.label || placeholder}
            </SelectTrigger>
            <SelectValue placeholder={placeholder} />
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked === true)}
            disabled={disabled}
            className={`${error ? 'border-red-500' : ''} ${className}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value instanceof Date ? value.toISOString().split('T')[0] : (value != null ? String(value) : '')}
            onChange={(e) => onChange(new Date(e.target.value))}
            disabled={disabled}
            className={`${error ? 'border-red-500' : ''} ${className}`}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={typeof value === 'number' ? value : value != null ? Number(value) : ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            disabled={disabled}
            min={min !== undefined ? Number(min) : undefined}
            max={max !== undefined ? Number(max) : undefined}
            className={`${error ? 'border-red-500' : ''} ${className}`}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            value={typeof value === 'string' ? value : value != null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${error ? 'border-red-500' : ''} ${className}`}
          />
        );
      case 'password':
        return (
          <Input
            type="password"
            value={typeof value === 'string' ? value : value != null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${error ? 'border-red-500' : ''} ${className}`}
          />
        );
      default:
        return (
          <Input
            value={typeof value === 'string' ? value : value != null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${error ? 'border-red-500' : ''} ${className}`}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {type !== 'checkbox' && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderInput()}
      {helper && (
        <div className="text-xs text-muted-foreground">{helper}</div>
      )}
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
    </div>
  );
};