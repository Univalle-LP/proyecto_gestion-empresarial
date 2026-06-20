/**
 * Utilidades de validación globales para la API
 */

/**
 * Valida un campo de texto genérico (como un nombre).
 * Reglas:
 * - Debe ser de tipo string.
 * - No puede estar vacío (si es obligatorio).
 * - Máximo de 100 caracteres.
 */
export function validateText(text: any, fieldName: string, required: boolean = true): string | null {
  if (text === undefined || text === null || text === '') {
    return required ? `El campo ${fieldName} es obligatorio.` : null;
  }
  if (typeof text !== 'string') {
    return `El campo ${fieldName} debe ser texto válido.`;
  }
  if (text.length > 100) {
    return `El campo ${fieldName} no puede exceder los 100 caracteres.`;
  }
  return null; // Nulo significa que no hay error (es válido)
}

/**
 * Valida un correo electrónico.
 * Reglas:
 * - Debe ser string y cumplir formato de email.
 * - Máximo 100 caracteres.
 */
export function validateEmail(email: any): string | null {
  const textError = validateText(email, 'correo electrónico');
  if (textError) return textError;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El formato del correo electrónico no es válido.';
  }
  return null;
}

/**
 * Valida una contraseña.
 * Reglas:
 * - Debe ser string.
 * - Mínimo 8 caracteres, máximo 100.
 * - Al menos una mayúscula, una minúscula, un número y un símbolo.
 */
export function validatePassword(password: any): string | null {
  const textError = validateText(password, 'contraseña');
  if (textError) return textError;

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonalphas) {
    return 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo especial.';
  }

  return null;
}

/**
 * Valida un número genérico.
 * Reglas:
 * - Debe ser estrictamente número o string numérico válido.
 * - No puede ser negativo (si no se permite).
 * - No debe contener letras ni símbolos extraños.
 */
export function validateNumber(value: any, fieldName: string, allowNegative: boolean = false): string | null {
  if (value === undefined || value === null || value === '') {
    return `El campo ${fieldName} es obligatorio.`;
  }
  
  // Intentar convertir a número
  const num = Number(value);
  if (isNaN(num)) {
    return `El campo ${fieldName} debe ser un número válido, sin letras ni símbolos.`;
  }

  if (!allowNegative && num < 0) {
    return `El campo ${fieldName} no puede ser un número negativo.`;
  }

  return null;
}
