import { createTheme, Theme } from '@mui/material/styles';
import { BrandConfig } from '../config/brands';

// Shared colors that don't change per brand
const sharedColors = {
  // Status Colors
  info: '#2961ff',
  success: '#56d481',
  warning: '#f37b22',
  error: '#F44336',
  
  // Grays
  gray100: '#f8f9fa',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#4F5467',
  gray800: '#343a40',
  gray900: '#212529',
  
  // UI Colors
  bodyColor: '#eef5f9',
  bodyText: '#3a3a4a',
  headingText: '#455a64',
  headingFont: '#414755',
  light: '#e9edf2',
  
  // Background
  background: {
    default: '#eef5f9',
    paper: '#ffffff',
  },
};

export const createBrandTheme = (brand: BrandConfig): Theme => {
  const { colors } = brand;

  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: colors.primary,
        light: colors.primaryLight,
        dark: colors.primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondaryLight,
        dark: colors.secondaryDark,
        contrastText: '#ffffff',
      },
      error: {
        main: sharedColors.error,
        light: '#ff7961',
        dark: '#ba000d',
      },
      warning: {
        main: sharedColors.warning,
        light: '#ff9f52',
        dark: '#c04d00',
      },
      info: {
        main: sharedColors.info,
        light: '#6188ff',
        dark: '#0040dc',
      },
      success: {
        main: sharedColors.success,
        light: '#8cffaf',
        dark: '#1fa254',
      },
      background: {
        default: sharedColors.background.default,
        paper: sharedColors.background.paper,
      },
      text: {
        primary: sharedColors.headingFont,
        secondary: sharedColors.bodyText,
      },
      divider: 'rgba(120, 130, 140, 0.13)',
    },
    
    typography: {
      fontFamily: [
        'Nunito Sans',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: 14,
      
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        color: sharedColors.headingText,
      },
      h2: {
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1.3,
        color: sharedColors.headingText,
      },
      h3: {
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: sharedColors.headingText,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: sharedColors.headingText,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
        color: sharedColors.headingText,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.6,
        color: sharedColors.headingText,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.75,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.57,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: sharedColors.bodyText,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.43,
        color: sharedColors.bodyText,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    
    shape: {
      borderRadius: 3,
    },
    
    shadows: [
      'none',
      '0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 3px 1px -2px rgba(0, 0, 0, 0.02), 0 1px 5px 0 rgba(0, 0, 0, 0.02)',
      '0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 3px 1px -2px rgba(0, 0, 0, 0.02), 0 1px 5px 0 rgba(0, 0, 0, 0.02)',
      '0 3px 4px 0 rgba(0, 0, 0, 0.07), 0 3px 3px -2px rgba(0, 0, 0, 0.04), 0 1px 8px 0 rgba(0, 0, 0, 0.05)',
      '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 5px 0 rgba(0, 0, 0, 0.04), 0 1px 10px 0 rgba(0, 0, 0, 0.05)',
      '0 3px 5px -1px rgba(0, 0, 0, 0.06), 0 5px 8px 0 rgba(0, 0, 0, 0.04), 0 1px 14px 0 rgba(0, 0, 0, 0.05)',
      '0 3px 5px -1px rgba(0, 0, 0, 0.06), 0 6px 10px 0 rgba(0, 0, 0, 0.04), 0 1px 18px 0 rgba(0, 0, 0, 0.05)',
      '0 4px 5px -2px rgba(0, 0, 0, 0.06), 0 7px 10px 1px rgba(0, 0, 0, 0.04), 0 2px 16px 1px rgba(0, 0, 0, 0.05)',
      '0 5px 5px -3px rgba(0, 0, 0, 0.06), 0 8px 10px 1px rgba(0, 0, 0, 0.04), 0 3px 14px 2px rgba(0, 0, 0, 0.05)',
      '0 5px 6px -3px rgba(0, 0, 0, 0.06), 0 9px 12px 1px rgba(0, 0, 0, 0.04), 0 3px 16px 2px rgba(0, 0, 0, 0.05)',
      '0 6px 6px -3px rgba(0, 0, 0, 0.06), 0 10px 14px 1px rgba(0, 0, 0, 0.04), 0 4px 18px 3px rgba(0, 0, 0, 0.05)',
      '0 6px 7px -4px rgba(0, 0, 0, 0.06), 0 11px 15px 1px rgba(0, 0, 0, 0.04), 0 4px 20px 3px rgba(0, 0, 0, 0.05)',
      '0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 12px 17px 2px rgba(0, 0, 0, 0.04), 0 5px 22px 4px rgba(0, 0, 0, 0.05)',
      '0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 13px 19px 2px rgba(0, 0, 0, 0.04), 0 5px 24px 4px rgba(0, 0, 0, 0.05)',
      '0 7px 9px -4px rgba(0, 0, 0, 0.06), 0 14px 21px 2px rgba(0, 0, 0, 0.04), 0 5px 26px 4px rgba(0, 0, 0, 0.05)',
      '0 8px 9px -5px rgba(0, 0, 0, 0.06), 0 15px 22px 2px rgba(0, 0, 0, 0.04), 0 6px 28px 5px rgba(0, 0, 0, 0.05)',
      '0 8px 10px -5px rgba(0, 0, 0, 0.06), 0 16px 24px 2px rgba(0, 0, 0, 0.04), 0 6px 30px 5px rgba(0, 0, 0, 0.05)',
      '0 8px 11px -5px rgba(0, 0, 0, 0.06), 0 17px 26px 2px rgba(0, 0, 0, 0.04), 0 6px 32px 5px rgba(0, 0, 0, 0.05)',
      '0 9px 11px -5px rgba(0, 0, 0, 0.06), 0 18px 28px 2px rgba(0, 0, 0, 0.04), 0 7px 34px 6px rgba(0, 0, 0, 0.05)',
      '0 9px 12px -6px rgba(0, 0, 0, 0.06), 0 19px 29px 2px rgba(0, 0, 0, 0.04), 0 7px 36px 6px rgba(0, 0, 0, 0.05)',
      '0 10px 13px -6px rgba(0, 0, 0, 0.06), 0 20px 31px 3px rgba(0, 0, 0, 0.04), 0 8px 38px 7px rgba(0, 0, 0, 0.05)',
      '0 10px 13px -6px rgba(0, 0, 0, 0.06), 0 21px 33px 3px rgba(0, 0, 0, 0.04), 0 8px 40px 7px rgba(0, 0, 0, 0.05)',
      '0 10px 14px -6px rgba(0, 0, 0, 0.06), 0 22px 35px 3px rgba(0, 0, 0, 0.04), 0 8px 42px 7px rgba(0, 0, 0, 0.05)',
      '0 11px 14px -7px rgba(0, 0, 0, 0.06), 0 23px 36px 3px rgba(0, 0, 0, 0.04), 0 9px 44px 8px rgba(0, 0, 0, 0.05)',
      '0 11px 15px -7px rgba(0, 0, 0, 0.06), 0 24px 38px 3px rgba(0, 0, 0, 0.04), 0 9px 46px 8px rgba(0, 0, 0, 0.05)',
    ],
    
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: "'Nunito Sans', sans-serif",
          },
          '*': {
            boxSizing: 'border-box',
          },
        },
      },
      
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 22px',
            boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 3px 1px -2px rgba(0, 0, 0, 0.02), 0 1px 5px 0 rgba(0, 0, 0, 0.02)',
            '&:hover': {
              boxShadow: '0 3px 4px 0 rgba(0, 0, 0, 0.07), 0 3px 3px -2px rgba(0, 0, 0, 0.04), 0 1px 8px 0 rgba(0, 0, 0, 0.05)',
            },
          },
          contained: {
            boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 3px 1px -2px rgba(0, 0, 0, 0.02), 0 1px 5px 0 rgba(0, 0, 0, 0.02)',
          },
        },
      },
      
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 3,
            boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 3px 1px -2px rgba(0, 0, 0, 0.02), 0 1px 5px 0 rgba(0, 0, 0, 0.02)',
          },
        },
      },
      
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 3,
          },
          elevation1: {
            boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 3px 1px -2px rgba(0, 0, 0, 0.02), 0 1px 5px 0 rgba(0, 0, 0, 0.02)',
          },
        },
      },
      
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              fontSize: '14px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '14px',
            },
            '& .MuiFormHelperText-root': {
              fontSize: '12px',
            },
          },
        },
        defaultProps: {
          size: 'small',
        },
      },
      
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 3px 1px -2px rgba(0, 0, 0, 0.02), 0 1px 5px 0 rgba(0, 0, 0, 0.02)',
          },
          colorDefault: {
            backgroundColor: '#ffffff',
            color: sharedColors.headingFont,
          },
        },
      },
      
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 3,
            fontWeight: 600,
          },
        },
      },
      
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            backgroundColor: sharedColors.gray100,
            color: sharedColors.headingFont,
          },
        },
      },
      
      RaDatagrid: {
        styleOverrides: {
          root: {
            '& .RaDatagrid-headerCell': {
              fontWeight: 700,
              backgroundColor: sharedColors.gray100,
            },
          },
        },
      },
      
      RaMenuItemLink: {
        styleOverrides: {
          root: {
            borderRadius: 3,
            margin: '4px 8px',
            padding: '8px 16px',
            '&.RaMenuItemLink-active': {
              backgroundColor: colors.primary,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: colors.primaryLight,
              },
            },
          },
        },
      },
      
      // Sidebar genişlik override
      RaSidebar: {
        styleOverrides: {
          root: {
            width: 88,
            '&.RaSidebar-open': {
              width: 250,
            },
          },
          fixed: {
            width: 88,
            '&.RaSidebar-open': {
              width: 250,
            },
          },
          docked: {
            width: 88,
            '&.RaSidebar-open': {
              width: 250,
            },
          },
        },
      },
    },
  });
};

// Export default theme for backwards compatibility
import { brands } from '../config/brands';
export const theme = createBrandTheme(brands.tofas);

