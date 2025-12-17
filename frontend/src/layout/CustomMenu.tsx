import { Menu, usePermissions } from 'react-admin';
import { Box, Typography, Divider, useTheme, alpha } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';

export const CustomMenu = () => {
  const { permissions } = usePermissions();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const isAdmin = permissions === 'admin';
  const isModerator = permissions === 'moderator';

  return (
    <Box
      sx={{
        width: 250,
        height: '100%',
        background: '#ffffff',
        color: primaryColor,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 8px 16px',
          '& .RaMenuItemLink-root': {
            color: primaryColor,
            borderRadius: '4px',
            margin: '2px 15px',
            padding: '12px 10px',
            minHeight: '48px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(primaryColor, 0.08),
              transform: 'translateX(4px)',
            },
            '&.RaMenuItemLink-active': {
              backgroundColor: primaryColor,
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: primaryLight,
              },
            },
          },
          '& .MuiListItemIcon-root': {
            color: primaryColor,
            minWidth: 40,
            marginRight: '10px',
          },
          '& .RaMenuItemLink-active .MuiListItemIcon-root': {
            color: '#fff',
          },
          '& .MuiTypography-root': {
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.02em',
          },
        }}
      >
        <Menu>
          <Menu.DashboardItem
            leftIcon={<DashboardIcon />}
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: 600,
              },
            }}
          />
          
          <Divider
            sx={{
              margin: '12px 16px',
              borderColor: alpha(primaryColor, 0.12),
            }}
          />

          <Menu.ResourceItem
            name="creatives/requests"
            leftIcon={<ImageIcon />}
          />

          <Menu.ResourceItem
            name="incentives/requests"
            leftIcon={<CardGiftcardIcon />}
          />

          <Menu.ResourceItem
            name="campaigns/requests"
            leftIcon={<CampaignIcon />}
          />

          {(isAdmin || isModerator) && (
            <Menu.ResourceItem
              name="dealers"
              leftIcon={<StoreIcon />}
            />
          )}

          {isAdmin && (
            <Menu.ResourceItem
              name="users"
              leftIcon={<PeopleIcon />}
            />
          )}
        </Menu>
      </Box>

      {/* Sidebar Footer */}
      <Box
        sx={{
          padding: 2,
          borderTop: `1px solid ${alpha(primaryColor, 0.12)}`,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: alpha(primaryColor, 0.6),
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          Tofaş Bayi Otomasyonu
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: alpha(primaryColor, 0.4),
            fontSize: '11px',
            fontWeight: 400,
          }}
        >
          v1.0.0 © 2025
        </Typography>
      </Box>
    </Box>
  );
};
