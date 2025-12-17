import { AppBar, UserMenu, Logout } from 'react-admin';
import { Box, Typography } from '@mui/material';

const CustomUserMenu = () => (
  <UserMenu>
    <Logout />
  </UserMenu>
);

export const CustomAppBar = () => (
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
        src="/assets/images/ford-logo.svg"
        alt="Ford Logo"
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
);
