import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box, useTheme, Divider, ListItemIcon } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogout, useGetIdentity } from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { ChangePasswordDialog } from '../../components/ChangePasswordDialog';

export const DealerAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const theme = useTheme();
  const { data: identity } = useGetIdentity();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleOpenPasswordDialog = () => {
    handleMenuClose();
    setPasswordDialogOpen(true);
  };

  const showBackButton = location.pathname !== '/dealer';

  const getPageTitle = () => {
    if (location.pathname === '/dealer') return 'Tofaş Bayi Otomasyonu';
    if (location.pathname.includes('creative')) return 'Kreatif Talebi';
    if (location.pathname.includes('incentive')) return 'Teşvik Talebi';
    if (location.pathname.includes('requests')) return 'Taleplerim';
    return 'Tofaş Bayi Otomasyonu';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: theme.palette.primary.main,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1200,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '56px !important',
          paddingX: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left: Back button + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showBackButton && (
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ color: 'white', padding: 0.5 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box
            component="img"
            src="/assets/images/tofas-logo.png"
            alt="Tofaş"
            onClick={() => navigate('/dealer')}
            sx={{ 
              height: '20px', 
              filter: 'brightness(0) invert(1)',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          />
        </Box>

        {/* Center: Page Title */}
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            flex: 1,
            textAlign: 'center',
          }}
        >
          {getPageTitle()}
        </Typography>

        {/* Right: User Menu */}
        <Box sx={{ minWidth: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{ color: 'white', padding: 0.5 }}
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                minWidth: 180,
                mt: 1,
              }
            }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {identity?.fullName || 'Kullanıcı'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleOpenPasswordDialog}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Şifre Değiştir
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </AppBar>
  );
};

