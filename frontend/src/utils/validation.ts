/**
 * Validation utilities for form inputs
 */

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateRequired(value: string | null | undefined, fieldName: string): string | null {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateTaskTitle(title: string): string | null {
  if (!title || title.trim() === "") {
    return "Task title is required";
  }
  if (title.length > 200) {
    return "Task title must be less than 200 characters";
  }
  return null;
}

export function validateProjectName(name: string): string | null {
  if (!name || name.trim() === "") {
    return "Project name is required";
  }
  if (name.length > 100) {
    return "Project name must be less than 100 characters";
  }
  return null;
}

/**
 * Validates multiple fields and returns array of errors
 */
export function validateFields(fields: Record<string, string | null | undefined>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const [field, value] of Object.entries(fields)) {
    const error = validateRequired(value, field);
    if (error) {
      errors.push({ field, message: error });
    }
  }
  
  return errors;
}
