import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useEffect, useState } from 'react';

export const DealerBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Update active tab based on current route
    if (location.pathname === '/dealer') {
      setValue(0);
    } else if (location.pathname.includes('creative')) {
      setValue(1);
    } else if (location.pathname.includes('incentive')) {
      setValue(2);
    } else if (location.pathname.includes('requests')) {
      setValue(3);
    }
  }, [location]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    switch (newValue) {
      case 0:
        navigate('/dealer');
        break;
      case 1:
        navigate('/dealer/creative-requests/create');
        break;
      case 2:
        navigate('/dealer/incentive-requests/create');
        break;
      case 3:
        navigate('/dealer/requests');
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          height: '56px',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            color: '#999',
            '&.Mui-selected': {
              color: '#00095B',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '11px',
            fontWeight: 500,
            '&.Mui-selected': {
              fontSize: '11px',
              fontWeight: 600,
            },
          },
        }}
      >
        <BottomNavigationAction label="Anasayfa" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Görsel Talep" icon={<ImageIcon />} />
        <BottomNavigationAction label="Teşvik Talep" icon={<CardGiftcardIcon />} />
        <BottomNavigationAction label="Taleplerim" icon={<ListAltIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

