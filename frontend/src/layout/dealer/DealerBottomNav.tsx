import { Paper, BottomNavigation, BottomNavigationAction, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useEffect, useState } from 'react';
import { useBrand } from '../../context/BrandContext';

export const DealerBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { buildUrl } = useBrand();
  const [value, setValue] = useState(0);
  const dealerBasePath = buildUrl('/dealer');

  useEffect(() => {
    // Update active tab based on current route
    if (location.pathname === dealerBasePath) {
      setValue(0);
    } else if (location.pathname.includes('creative')) {
      setValue(1);
    } else if (location.pathname.includes('incentive')) {
      setValue(2);
    } else if (location.pathname.includes('campaign')) {
      setValue(3);
    } else if (location.pathname.includes('requests')) {
      setValue(4);
    }
  }, [location, dealerBasePath]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    switch (newValue) {
      case 0:
        navigate(dealerBasePath);
        break;
      case 1:
        navigate(`${dealerBasePath}/creative-requests/create`);
        break;
      case 2:
        navigate(`${dealerBasePath}/incentive-requests/create`);
        break;
      case 3:
        navigate(`${dealerBasePath}/campaign-requests/create`);
        break;
      case 4:
        navigate(`${dealerBasePath}/requests`);
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
              color: theme.palette.primary.main,
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
        <BottomNavigationAction label="Kreatif" icon={<ImageIcon />} />
        <BottomNavigationAction label="Teşvik" icon={<CardGiftcardIcon />} />
        <BottomNavigationAction label="Kampanya" icon={<CampaignIcon />} />
        <BottomNavigationAction label="Talepler" icon={<ListAltIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

