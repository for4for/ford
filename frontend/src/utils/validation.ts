/**
 * Validation Utilities
 * Tüm formlar için ortak validation fonksiyonları
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmail = (value: string): string | undefined => {
  if (!value) return undefined;
  if (!isValidEmail(value)) return 'Geçerli bir e-posta adresi giriniz';
  return undefined;
};

// Phone validation - Türkiye formatı (11 haneli)
export const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('0');
};

export const validatePhone = (value: string): string | undefined => {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, '');
  if (digits.length > 0 && digits.length < 11) {
    return 'Telefon numarası 11 haneli olmalıdır';
  }
  if (digits.length === 11 && !digits.startsWith('0')) {
    return 'Telefon numarası 0 ile başlamalıdır';
  }
  return undefined;
};

// Telefon formatla
export const formatPhoneNumber = (value: string): string => {
  const n = value.replace(/\D/g, '');
  if (!n) return '';
  if (n.length <= 1) return `0(${n}`;
  if (n.length <= 4) return `0(${n.slice(1)}`;
  if (n.length <= 7) return `0(${n.slice(1, 4)}) ${n.slice(4)}`;
  if (n.length <= 9) return `0(${n.slice(1, 4)}) ${n.slice(4, 7)} ${n.slice(7)}`;
  return `0(${n.slice(1, 4)}) ${n.slice(4, 7)} ${n.slice(7, 9)} ${n.slice(9, 11)}`;
};

// Password validation
export const validatePassword = (value: string, minLength = 6): string | undefined => {
  if (!value) return undefined;
  if (value.length < minLength) {
    return `Şifre en az ${minLength} karakter olmalıdır`;
  }
  return undefined;
};

// Password match validation
export const validatePasswordMatch = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) return undefined;
  if (password !== confirmPassword) {
    return 'Şifreler eşleşmiyor';
  }
  return undefined;
};

// Required validation
export const validateRequired = (value: string, fieldName?: string): string | undefined => {
  if (!value || !value.trim()) {
    return fieldName ? `${fieldName} zorunludur` : 'Bu alan zorunludur';
  }
  return undefined;
};

// Min length validation
export const validateMinLength = (value: string, minLength: number): string | undefined => {
  if (!value) return undefined;
  if (value.length < minLength) {
    return `En az ${minLength} karakter olmalıdır`;
  }
  return undefined;
};

// React-Admin için validator factory'ler
export const requiredValidator = (message?: string) => (value: any) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return message || 'Bu alan zorunludur';
  }
  return undefined;
};

export const emailValidator = () => (value: string) => {
  if (!value) return undefined;
  return validateEmail(value);
};

export const phoneValidator = () => (value: string) => {
  if (!value) return undefined;
  return validatePhone(value);
};

export const passwordValidator = (minLength = 6) => (value: string) => {
  if (!value) return undefined;
  return validatePassword(value, minLength);
};

export const passwordMatchValidator = (passwordField = 'password') => (value: string, allValues: any) => {
  if (!value) return undefined;
  return validatePasswordMatch(allValues[passwordField], value);
};

// Form field error state manager
export interface FieldErrors {
  [key: string]: string | undefined;
}

export const createFieldValidator = (
  validators: { [field: string]: (value: string, allValues?: any) => string | undefined }
) => {
  return (field: string, value: string, allValues?: any): string | undefined => {
    const validator = validators[field];
    if (validator) {
      return validator(value, allValues);
    }
    return undefined;
  };
};

