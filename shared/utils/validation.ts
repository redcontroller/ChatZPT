// Validation utilities

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Name validation
export const isValidName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.trim().length >= 2 && name.trim().length <= 50;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation (basic)
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Check if it's a valid length (7-15 digits)
  return digits.length >= 7 && digits.length <= 15;
};

// UUID validation
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// JWT token validation (basic structure check)
export const isValidJWTStructure = (token: string): boolean => {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Form validation helpers
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return null;
};

export const validatePattern = (value: string, pattern: RegExp, fieldName: string, message?: string): string | null => {
  if (!pattern.test(value)) {
    return message || `${fieldName} format is invalid`;
  }
  return null;
};

// Generic form validator
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export const validateField = (value: any, rules: ValidationRule, fieldName: string): string | null => {
  // Required validation
  if (rules.required) {
    const requiredError = validateRequired(value, fieldName);
    if (requiredError) return requiredError;
  }
  
  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return null;
  }
  
  // Min length validation
  if (rules.minLength && typeof value === 'string') {
    const minLengthError = validateMinLength(value, rules.minLength, fieldName);
    if (minLengthError) return minLengthError;
  }
  
  // Max length validation
  if (rules.maxLength && typeof value === 'string') {
    const maxLengthError = validateMaxLength(value, rules.maxLength, fieldName);
    if (maxLengthError) return maxLengthError;
  }
  
  // Pattern validation
  if (rules.pattern && typeof value === 'string') {
    const patternError = validatePattern(value, rules.pattern, fieldName, rules.message);
    if (patternError) return patternError;
  }
  
  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }
  
  return null;
};

// Validate entire form
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, ValidationRule>
): Record<keyof T, string> => {
  const errors: Record<keyof T, string> = {} as Record<keyof T, string>;
  
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[fieldName], fieldRules, fieldName);
    if (error) {
      errors[fieldName as keyof T] = error;
    }
  }
  
  return errors;
};
