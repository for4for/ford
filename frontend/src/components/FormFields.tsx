/**
 * Reusable Form Components
 * Tüm formlar için ortak form bileşenleri
 */

import { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { TextInput, PasswordInput, SelectInput, useInput } from 'react-admin';
import { useWatch, useFormContext } from 'react-hook-form';
import { 
  formatPhoneNumber, 
  validatePhone, 
  validateEmail, 
  validateRequired,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation';

// ============================================
// STYLES
// ============================================

// Input stilleri - minimal ve temiz
export const inputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    borderRadius: '8px',
    '& fieldset': { borderColor: '#d1d5db' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '1.5px' },
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 12px',
    fontSize: 14,
  },
  '& .MuiInputLabel-root': { display: 'none' },
  '& .MuiFormHelperText-root': { display: 'none' },
};

// Error state için input stilleri
export const inputErrorStyles = {
  ...inputStyles,
  '& .MuiOutlinedInput-root': {
    ...inputStyles['& .MuiOutlinedInput-root'],
    '& fieldset': { borderColor: '#ef4444' },
    '&:hover fieldset': { borderColor: '#dc2626' },
  },
};

// ============================================
// FIELD WRAPPER
// ============================================

interface FieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}

export const Field = ({ label, children, required, hint, error }: FieldProps) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography
      component="label"
      sx={{
        display: 'block',
        fontSize: 13,
        fontWeight: 500,
        color: '#374151',
        mb: 0.75,
      }}
    >
      {label}
      {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </Typography>
    {children}
    {error ? (
      <Typography sx={{ fontSize: 12, color: '#ef4444', mt: 0.5 }}>
        {error}
      </Typography>
    ) : hint ? (
      <Typography sx={{ fontSize: 12, color: '#6b7280', mt: 0.5 }}>
        {hint}
      </Typography>
    ) : null}
  </Box>
);

// ============================================
// SECTION HEADER
// ============================================

interface SectionProps {
  title: string;
  first?: boolean;
}

export const Section = ({ title, first }: SectionProps) => (
  <Typography
    sx={{
      fontSize: 15,
      fontWeight: 600,
      color: '#111827',
      mb: 2,
      mt: first ? 0 : 3,
      pb: 1,
      borderBottom: '1px solid #e5e7eb',
    }}
  >
    {title}
  </Typography>
);

// ============================================
// PHONE INPUT with Validation
// ============================================

interface PhoneInputFieldProps {
  source: string;
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  [key: string]: any;
}

export const PhoneInputField = ({
  source,
  label = 'Telefon',
  required,
  hint,
  error,
  ...props
}: PhoneInputFieldProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setDisplayValue(formatted);
    // Yazarken hatayı temizle
    if (localError) setLocalError(undefined);
  }, [localError]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const value = e.target.value;
    
    // Required kontrolü
    if (required && !value) {
      setLocalError(`${label} zorunludur`);
      return;
    }
    
    // Format kontrolü
    const validationError = validatePhone(value);
    setLocalError(validationError);
  }, [required, label]);

  const currentError = touched ? (error || localError) : undefined;

  // Validatorları oluştur - submit'i engellemek için
  const validators: any[] = [];
  
  if (required) {
    validators.push((value: string) => {
      if (!value) return `${label} zorunludur`;
      return undefined;
    });
  }
  
  // Telefon format validator
  validators.push((value: string) => {
    if (value) return validatePhone(value);
    return undefined;
  });

  return (
    <Field label={label} required={required} hint={currentError ? undefined : hint} error={currentError}>
      <TextInput
        source={source}
        validate={validators}
        format={(value: string) => (value ? formatPhoneNumber(value) : displayValue)}
        parse={(value: string) => value.replace(/\D/g, '')}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0(5XX) XXX XX XX"
        inputProps={{ maxLength: 17 }}
        fullWidth
        sx={currentError ? inputErrorStyles : inputStyles}
        {...props}
      />
    </Field>
  );
};

// ============================================
// EMAIL INPUT with Validation
// ============================================

interface EmailInputFieldProps {
  source: string;
  label?: string;
  required?: boolean;
  hint?: string;
  validate?: any[];
  error?: string;
  [key: string]: any;
}

export const EmailInputField = ({
  source,
  label = 'E-posta',
  required,
  hint,
  validate,
  error,
  ...props
}: EmailInputFieldProps) => {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <TextInput
        source={source}
        validate={validate}
        fullWidth
        sx={error ? inputErrorStyles : inputStyles}
        {...props}
      />
    </Field>
  );
};

// ============================================
// PASSWORD INPUT with onBlur Validation
// ============================================

interface PasswordInputFieldProps {
  source: string;
  label?: string;
  required?: boolean;
  hint?: string;
  validate?: any[];
  error?: string;
  minLength?: number;
  confirmOf?: string; // Şifre tekrar alanı için ana şifre field adı (ör: 'password')
  [key: string]: any;
}

export const PasswordInputField = ({
  source,
  label = 'Şifre',
  required,
  hint,
  validate = [],
  error,
  minLength = 6,
  confirmOf,
  ...props
}: PasswordInputFieldProps) => {
  const [localError, setLocalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  
  // Şifre tekrar alanı için ana şifre değerini izle
  const mainPassword = useWatch({ name: confirmOf || '' });

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const value = e.target.value || '';
    
    // Şifre tekrar alanı için
    if (confirmOf) {
      // Ana şifre girilmişse tekrar zorunlu
      if (mainPassword && !value) {
        setLocalError('Şifre tekrarı zorunludur');
        return;
      }
      // Eşleşme kontrolü
      if (value && mainPassword && value !== mainPassword) {
        setLocalError('Şifreler eşleşmiyor');
        return;
      }
      setLocalError(undefined);
      return;
    }
    
    // Normal şifre alanı için
    // Required kontrolü
    if (required && !value) {
      setLocalError(`${label} zorunludur`);
      return;
    }
    
    // Min length kontrolü
    if (value && value.length < minLength) {
      setLocalError(`Şifre en az ${minLength} karakter olmalıdır`);
      return;
    }
    
    setLocalError(undefined);
  }, [required, label, minLength, confirmOf, mainPassword]);

  const handleChange = useCallback(() => {
    if (localError) setLocalError(undefined);
  }, [localError]);

  const currentError = touched ? (error || localError) : undefined;

  // Validatorları birleştir - submit'i engellemek için
  const allValidators = [...validate];
  
  // Required validator ekle
  if (required) {
    allValidators.push((value: string) => {
      if (!value) return `${label} zorunludur`;
      return undefined;
    });
  }
  
  // Min length validator ekle (confirmOf yoksa)
  if (!confirmOf) {
    allValidators.push((value: string) => {
      if (value && value.length < minLength) {
        return `Şifre en az ${minLength} karakter olmalıdır`;
      }
      return undefined;
    });
  }
  
  // Şifre eşleşme validator ekle (confirmOf varsa)
  if (confirmOf) {
    allValidators.push((value: string, allValues: any) => {
      const mainPass = allValues[confirmOf];
      if (mainPass && !value) {
        return 'Şifre tekrarı zorunludur';
      }
      if (value && mainPass && value !== mainPass) {
        return 'Şifreler eşleşmiyor';
      }
      return undefined;
    });
  }

  return (
    <Field label={label} required={required} hint={currentError ? undefined : hint} error={currentError}>
      <PasswordInput
        source={source}
        validate={allValidators}
        fullWidth
        onBlur={handleBlur}
        onChange={handleChange}
        sx={currentError ? inputErrorStyles : inputStyles}
        {...props}
      />
    </Field>
  );
};

// ============================================
// TEXT INPUT FIELD with onBlur validation
// ============================================

interface TextInputFieldProps {
  source: string;
  label: string;
  required?: boolean;
  hint?: string;
  validate?: any[];
  error?: string;
  type?: 'text' | 'email';
  [key: string]: any;
}

export const TextInputField = ({
  source,
  label,
  required,
  hint,
  validate = [],
  error,
  type = 'text',
  ...props
}: TextInputFieldProps) => {
  const [localError, setLocalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const value = e.target.value?.trim() || '';
    
    // Required kontrolü
    if (required && !value) {
      setLocalError(`${label} zorunludur`);
      return;
    }
    
    // Email kontrolü
    if (type === 'email' && value) {
      const emailError = validateEmail(value);
      if (emailError) {
        setLocalError(emailError);
        return;
      }
    }
    
    setLocalError(undefined);
  }, [required, label, type]);

  const handleChange = useCallback(() => {
    // Yazarken hatayı temizle
    if (localError) setLocalError(undefined);
  }, [localError]);

  const currentError = touched ? (error || localError) : undefined;

  // Validatorları birleştir - submit'i engellemek için
  const allValidators = [...validate];
  
  // Required validator ekle
  if (required) {
    allValidators.push((value: string) => {
      if (!value || !value.trim()) return `${label} zorunludur`;
      return undefined;
    });
  }
  
  // Email validator ekle
  if (type === 'email') {
    allValidators.push((value: string) => {
      if (value) return validateEmail(value);
      return undefined;
    });
  }

  return (
    <Field label={label} required={required} hint={currentError ? undefined : hint} error={currentError}>
      <TextInput
        source={source}
        validate={allValidators}
        fullWidth
        onBlur={handleBlur}
        onChange={handleChange}
        sx={currentError ? inputErrorStyles : inputStyles}
        {...props}
      />
    </Field>
  );
};

// ============================================
// SELECT INPUT FIELD with onBlur Validation
// ============================================

interface SelectInputFieldProps {
  source: string;
  label: string;
  choices: { id: string; name: string }[];
  required?: boolean;
  hint?: string;
  validate?: any[];
  error?: string;
  [key: string]: any;
}

export const SelectInputField = ({
  source,
  label,
  choices,
  required,
  hint,
  validate,
  error,
  ...props
}: SelectInputFieldProps) => {
  const [localError, setLocalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const currentError = touched ? error : undefined;

  return (
    <Field label={label} required={required} hint={currentError ? undefined : hint} error={currentError}>
      <SelectInput
        source={source}
        choices={choices}
        validate={validate}
        fullWidth
        onBlur={handleBlur}
        sx={currentError ? inputErrorStyles : inputStyles}
        {...props}
      />
    </Field>
  );
};

// ============================================
// FORM CONTAINER
// ============================================

interface FormContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const FormContainer = ({ children, maxWidth = 640 }: FormContainerProps) => (
  <Box
    sx={{
      maxWidth,
      mx: 'auto',
      px: 4,
      py: 5,
      minHeight: '100vh',
      bgcolor: '#f9fafb',
    }}
  >
    {children}
  </Box>
);

// ============================================
// FORM CARD
// ============================================

interface FormCardProps {
  children: React.ReactNode;
}

export const FormCard = ({ children }: FormCardProps) => (
  <Box
    sx={{
      bgcolor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      p: 4,
    }}
  >
    {children}
  </Box>
);

// ============================================
// FORM HEADER
// ============================================

interface FormHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children?: React.ReactNode;
}

export const FormHeader = ({ title, subtitle, onBack, children }: FormHeaderProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
    <Box
      onClick={onBack}
      sx={{
        width: 36,
        height: 36,
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        bgcolor: '#fff',
        '&:hover': { bgcolor: '#f3f4f6' },
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {children && (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
        {children}
      </Box>
    )}
  </Box>
);

// ============================================
// FORM TOOLBAR
// ============================================

interface FormToolbarButtonsProps {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel?: string;
}

export const formToolbarStyles = {
  p: 0,
  mt: 3,
  bgcolor: 'transparent',
  justifyContent: 'flex-end',
  gap: 1.5,
};

export const cancelButtonStyles = {
  color: '#374151',
  textTransform: 'none',
  fontWeight: 500,
  px: 3,
  py: 1,
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  '&:hover': { bgcolor: '#f9fafb' },
};

export const saveButtonStyles = {
  bgcolor: '#1a1a2e',
  textTransform: 'none',
  fontWeight: 500,
  px: 4,
  py: 1,
  borderRadius: '8px',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#2d2d44', boxShadow: 'none' },
};

