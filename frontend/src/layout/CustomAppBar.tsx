import { AppBar, UserMenu, Logout, useGetIdentity } from 'react-admin';
import { Box, Typography, MenuItem, ListItemIcon, Divider } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';

const ChangePasswordMenuItem = ({ onClick }: { onClick: () => void }) => (
  <MenuItem onClick={onClick}>
    <ListItemIcon>
      <SettingsIcon fontSize="small" />
    </ListItemIcon>
    Şifre Değiştir
  </MenuItem>
);

export const CustomAppBar = () => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { data: identity } = useGetIdentity();

  const CustomUserMenu = () => (
    <UserMenu>
      <MenuItem disabled sx={{ opacity: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {identity?.fullName || 'Kullanıcı'}
        </Typography>
      </MenuItem>
      <Divider />
      <ChangePasswordMenuItem onClick={() => setPasswordDialogOpen(true)} />
      <Logout />
    </UserMenu>
  );

  return (
    <>
      <AppBar
        color="default"
        elevation={1}
        userMenu={<CustomUserMenu />}
        sx={{
          '& .RaAppBar-toolbar': {
            padding: '0 24px',
            minHeight: 64,
          },
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src="/assets/images/tofas-logo.png"
            alt="Tofaş Logo"
            sx={{
              height: 28,
              width: 'auto',
            }}
          />
          
          {/* Title */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Bayi Otomasyonu
          </Typography>
        </Box>
      </AppBar>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </>
  );
};
