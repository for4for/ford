import { Menu, usePermissions, useSidebarState } from 'react-admin';
import { Box, Typography, Divider, useTheme, alpha } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';

export const CustomMenu = () => {
  const { permissions } = usePermissions();
  const [open] = useSidebarState();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const isAdmin = permissions === 'admin';
  const isModerator = permissions === 'moderator';

  return (
    <Box
      sx={{
        width: open ? 250 : 88,
        minWidth: open ? 250 : 88,
        height: '100%',
        background: '#ffffff',
        color: primaryColor,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e0e0e0',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: open ? '24px 8px 16px' : '24px 12px 16px',
          '& .RaMenuItemLink-root': {
            color: primaryColor,
            borderRadius: '8px',
            margin: open ? '4px 8px' : '4px 0',
            padding: open ? '12px 16px' : '12px 16px',
            minHeight: '48px',
            transition: 'all 0.2s ease',
            justifyContent: open ? 'flex-start' : 'center',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: alpha(primaryColor, 0.08),
              transform: open ? 'translateX(2px)' : 'none',
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
            minWidth: open ? 36 : 32,
            marginRight: open ? '12px' : '0',
            justifyContent: 'center',
            flexShrink: 0,
          },
          '& .RaMenuItemLink-active .MuiListItemIcon-root': {
            color: '#fff',
          },
          '& .MuiTypography-root': {
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            display: open ? 'block' : 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
              margin: open ? '12px 16px' : '12px 8px',
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
      {open && (
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
      )}
    </Box>
  );
};
