import { Button, useResourceContext } from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SxProps, Theme, useTheme, alpha } from '@mui/material';
import { useSmartBack } from '../hooks/useSmartBack';

/**
 * Smart Back to List Button
 * 
 * Kullanıcının nereden geldiğini otomatik algılar:
 * - Uygulama içi navigasyon varsa: navigate(-1) ile geri gider
 * - Direkt URL ile geldiyse: resource listesine yönlendirir
 */
interface BackToListButtonProps {
  resource?: string;
  label?: string;
  sx?: SxProps<Theme>;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  startIcon?: React.ReactElement;
  onClick?: () => void;
}

export const BackToListButton = ({
  resource: resourceProp,
  label = 'Geri Dön',
  sx: sxProp,
  variant = 'outlined',
  size = 'medium',
  startIcon = <ArrowBackIcon />,
  onClick: onClickProp,
  ...rest
}: BackToListButtonProps) => {
  const resourceFromContext = useResourceContext();
  const theme = useTheme();
  
  // Default styles using theme
  const defaultSx: SxProps<Theme> = {
    color: theme.palette.primary.main,
    borderColor: '#e0e0e0',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  };
  
  const sx = sxProp || defaultSx;
  
  // Use prop resource or fallback to ResourceContext
  const resource = resourceProp || resourceFromContext;

  const goBack = useSmartBack({ fallbackResource: resource });

  const handleBack = () => {
    if (onClickProp) {
      onClickProp();
      return;
    }
    goBack();
  };

  return (
    <Button
      onClick={handleBack}
      startIcon={startIcon}
      variant={variant}
      size={size}
      sx={sx}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default BackToListButton;
