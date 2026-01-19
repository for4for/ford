import { UserMenu, Logout, useGetIdentity, useSidebarState, useRefresh } from 'react-admin';
import { Box, Typography, MenuItem, ListItemIcon, Divider, AppBar as MuiAppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState, forwardRef } from 'react';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';

// Şifre değiştir menu item - forwardRef ile UserMenu uyumlu
const ChangePasswordMenuItem = forwardRef<HTMLLIElement, { onClick: () => void }>(
  ({ onClick }, ref) => (
    <MenuItem ref={ref} onClick={onClick}>
      <ListItemIcon>
        <SettingsIcon fontSize="small" />
      </ListItemIcon>
      Şifre Değiştir
    </MenuItem>
  )
);

export const CustomAppBar = () => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { data: identity } = useGetIdentity();
  const [open, setOpen] = useSidebarState();
  const refresh = useRefresh();

  return (
    <>
      <MuiAppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          zIndex: 1201,
          backgroundColor: '#fff',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 3 }}>
          {/* Menu Toggle */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label={open ? 'Menüyü Kapat' : 'Menüyü Aç'}
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component="img"
            src="/assets/images/tofas-logo.png"
            alt="Tofaş Logo"
            sx={{
              height: 28,
              width: 'auto',
              mr: 2,
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

          <Box sx={{ flex: 1 }} />

          {/* Refresh Button */}
          <IconButton
            color="inherit"
            aria-label="Yenile"
            onClick={() => refresh()}
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>

          {/* User Menu */}
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
        </Toolbar>
      </MuiAppBar>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </>
  );
};
