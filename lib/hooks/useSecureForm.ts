import { useState, useCallback } from 'react';
import { sanitize } from '../security/sanitize';

type FieldType = 'text' | 'email' | 'number' | 'phone' | 'url';

export interface FormField {
  name: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
}

export interface FormErrors {
  [key: string]: string;
}

export function useSecureForm<T extends Record<string, any>>(config: FormConfig) {
  const [values, setValues] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: FormField, value: any): string | null => {
    if (field.required && (!value || String(value).trim().length === 0)) {
      return `${field.name} is required`;
    }

    if (!value) return null;

    const strValue = String(value);

    if (field.minLength && strValue.length < field.minLength) {
      return `${field.name} must be at least ${field.minLength} characters`;
    }

    if (field.maxLength && strValue.length > field.maxLength) {
      return `${field.name} must not exceed ${field.maxLength} characters`;
    }

    if (field.pattern && !field.pattern.test(strValue)) {
      return `${field.name} format is invalid`;
    }

    try {
      switch (field.type) {
        case 'email':
          sanitize.email(strValue);
          break;
        case 'phone':
          if (strValue.length < 10) {
            return 'Phone number must be at least 10 digits';
          }
          break;
        case 'number':
          sanitize.number(strValue);
          break;
        case 'url':
          sanitize.url(strValue);
          break;
        case 'text':
          if (sanitize.containsXss(strValue) || sanitize.containsSqlInjection(strValue)) {
            return 'Invalid input detected';
          }
          break;
      }
    } catch (error) {
      return error instanceof Error ? error.message : 'Validation failed';
    }

    return null;
  }, []);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    const field = config.fields.find(f => f.name === name);
    if (field && touched[name]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
  }, [config.fields, touched, validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    const field = config.fields.find(f => f.name === name);
    const value = values[name as keyof T];

    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
  }, [config.fields, values, validateField]);

  const sanitizeValues = useCallback((data: Partial<T>): T => {
    const sanitized: any = {};

    for (const field of config.fields) {
      const value = data[field.name as keyof T];
      if (value === undefined || value === null) continue;

      try {
        switch (field.type) {
          case 'text':
            sanitized[field.name] = sanitize.text(String(value));
            break;
          case 'email':
            sanitized[field.name] = sanitize.email(String(value));
            break;
          case 'phone':
            sanitized[field.name] = sanitize.phone(String(value));
            break;
          case 'number':
            sanitized[field.name] = sanitize.number(value);
            break;
          case 'url':
            sanitized[field.name] = sanitize.url(String(value));
            break;
          default:
            sanitized[field.name] = value;
        }
      } catch (error) {
        console.error(`Sanitization error for field ${field.name}:`, error);
      }
    }

    return sanitized as T;
  }, [config.fields]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    for (const field of config.fields) {
      const value = values[field.name as keyof T];
      const error = validateField(field, value);

      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [config.fields, values, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setTouched(
      config.fields.reduce((acc, field) => {
        acc[field.name] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedData = sanitizeValues(values);
      await config.onSubmit(sanitizedData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        _form: error instanceof Error ? error.message : 'Submission failed',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [config, values, validate, sanitizeValues]);

  const reset = useCallback(() => {
    setValues({});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}
