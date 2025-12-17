import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogout, useGetIdentity } from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';

export const DealerAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const { data: identity } = useGetIdentity();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const showBackButton = location.pathname !== '/dealer';

  const getPageTitle = () => {
    if (location.pathname === '/dealer') return 'Ford Bayi Otomasyonu';
    if (location.pathname.includes('creative')) return 'Kreatif Talebi';
    if (location.pathname.includes('incentive')) return 'Teşvik Talebi';
    if (location.pathname.includes('requests')) return 'Taleplerim';
    return 'Ford Bayi Otomasyonu';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#00095B',
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
            src="https://fof.ford.com.tr/Content/svg//logo-ford-logotype.svg"
            alt="Ford"
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
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {identity?.fullName || 'Kullanıcı'}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

