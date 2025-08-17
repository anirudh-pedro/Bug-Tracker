import { Strings } from '../constants/strings';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateBugForm = (data: {
  title: string;
  description: string;
  expectedBehavior: string;
  actualBehavior: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.title)) {
    errors.title = Strings.titleRequired;
  }

  if (!validateRequired(data.description)) {
    errors.description = Strings.descriptionRequired;
  }

  if (!validateRequired(data.expectedBehavior)) {
    errors.expectedBehavior = 'Expected behavior is required';
  }

  if (!validateRequired(data.actualBehavior)) {
    errors.actualBehavior = 'Actual behavior is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.email)) {
    errors.email = Strings.required;
  } else if (!validateEmail(data.email)) {
    errors.email = Strings.invalidEmail;
  }

  if (!validateRequired(data.password)) {
    errors.password = Strings.required;
  } else if (!validatePassword(data.password)) {
    errors.password = Strings.passwordTooShort;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.name)) {
    errors.name = Strings.required;
  }

  if (!validateRequired(data.email)) {
    errors.email = Strings.required;
  } else if (!validateEmail(data.email)) {
    errors.email = Strings.invalidEmail;
  }

  if (!validateRequired(data.password)) {
    errors.password = Strings.required;
  } else if (!validatePassword(data.password)) {
    errors.password = Strings.passwordTooShort;
  }

  if (!validateRequired(data.confirmPassword)) {
    errors.confirmPassword = Strings.required;
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = Strings.passwordsDoNotMatch;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
