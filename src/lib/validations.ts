/**
 * Utilidades de validación globales paramétricas
 */

export interface TextOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export function validateText(text: any, fieldName: string, options: TextOptions = {}): string | null {
  const { required = true, minLength = 0, maxLength = 100 } = options;

  if (text === undefined || text === null || text === '') {
    return required ? `El campo ${fieldName} es obligatorio.` : null;
  }
  if (typeof text !== 'string') {
    return `El campo ${fieldName} debe ser texto válido.`;
  }
  if (text.length < minLength) {
    return `El campo ${fieldName} debe tener al menos ${minLength} caracteres.`;
  }
  if (text.length > maxLength) {
    return `El campo ${fieldName} no puede exceder los ${maxLength} caracteres.`;
  }
  return null;
}

export interface EmailOptions {
  required?: boolean;
  maxLength?: number;
}

export function validateEmail(email: any, options: EmailOptions = {}): string | null {
  const textError = validateText(email, 'correo electrónico', { required: options.required ?? true, maxLength: options.maxLength ?? 100 });
  if (textError) return textError;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El formato del correo electrónico no es válido.';
  }
  return null;
}

export interface PasswordOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  requireUpper?: boolean;
  requireLower?: boolean;
  requireNumber?: boolean;
  requireSymbol?: boolean;
}

export function validatePassword(password: any, options: PasswordOptions = {}): string | null {
  const {
    required = true,
    minLength = 8,
    maxLength = 100,
    requireUpper = true,
    requireLower = true,
    requireNumber = true,
    requireSymbol = true
  } = options;

  const textError = validateText(password, 'contraseña', { required, minLength, maxLength });
  if (textError) return textError;

  if (requireUpper && !/[A-Z]/.test(password)) return 'La contraseña debe contener al menos una mayúscula.';
  if (requireLower && !/[a-z]/.test(password)) return 'La contraseña debe contener al menos una minúscula.';
  if (requireNumber && !/\d/.test(password)) return 'La contraseña debe contener al menos un número.';
  if (requireSymbol && !/\W/.test(password)) return 'La contraseña debe contener al menos un símbolo especial.';

  return null;
}

export interface NumberOptions {
  required?: boolean;
  allowNegative?: boolean;
  min?: number;
  max?: number;
}

export function validateNumber(value: any, fieldName: string, options: NumberOptions = {}): string | null {
  const { required = true, allowNegative = false, min, max } = options;

  if (value === undefined || value === null || value === '') {
    return required ? `El campo ${fieldName} es obligatorio.` : null;
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    return `El campo ${fieldName} debe ser un número válido, sin letras ni símbolos.`;
  }

  if (!allowNegative && num < 0) {
    return `El campo ${fieldName} no puede ser un número negativo.`;
  }

  if (min !== undefined && num < min) {
    return `El campo ${fieldName} debe ser mayor o igual a ${min}.`;
  }

  if (max !== undefined && num > max) {
    return `El campo ${fieldName} debe ser menor o igual a ${max}.`;
  }

  return null;
}
