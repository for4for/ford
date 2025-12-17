import { Button, useRedirect, useCreatePath, useResourceContext } from 'react-admin';
import { useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SxProps, Theme, useTheme, alpha } from '@mui/material';

/**
 * Smart Back to List Button with backgroundLocation support
 * 
 * Automatically detects if user arrived via modal/drawer pattern or direct link:
 * - Modal pattern (backgroundLocation exists): Uses history.back()
 * - Direct link (no backgroundLocation): Redirects to resource list
 * 
 * Uses useCreatePath which respects Admin's basename prop
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
  const location = useLocation();
  const redirect = useRedirect();
  const createPath = useCreatePath();
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

  const handleBack = () => {
    if (onClickProp) {
      // Custom onClick handler provided
      onClickProp();
      return;
    }

    if (location.state?.backgroundLocation) {
      // Modal pattern'den geliyorsa history.back()
      window.history.back();
    } else {
      // Direkt link ile geliyorsa listeye yönlendir
      if (resource) {
        redirect(createPath({ resource, type: 'list' }));
      } else {
        // Fallback: go back in history if no resource available
        window.history.back();
      }
    }
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
