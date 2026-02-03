import { Menu, usePermissions, useSidebarState, useGetList } from 'react-admin';
import { Box, Typography, Divider, useTheme, alpha, Badge, styled, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import { useBrand } from '../context/BrandContext';

// Kırmızı badge stili - tıklanabilir
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 700,
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    padding: '0 4px',
    cursor: 'pointer',
    zIndex: 1000,
    pointerEvents: 'auto',
    // Sol üst köşe
    top: -4,
    right: 'auto',
    left: -8,
    transform: 'none',
    '&:hover': {
      backgroundColor: '#b91c1c',
    },
    transition: 'background-color 0.2s ease',
  },
}));

export const CustomMenu = () => {
  const { permissions } = usePermissions();
  const [open] = useSidebarState();
  const theme = useTheme();
  const navigate = useNavigate();
  const { brand, buildUrl } = useBrand();
  const primaryColor = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const isAdmin = permissions === 'admin';
  const isModerator = permissions === 'moderator';
  const basePath = buildUrl('/backoffice');

  // Onay bekleyen bayi sayısı
  const { total: pendingDealers } = useGetList('dealers', {
    pagination: { page: 1, perPage: 1 },
    filter: { status: 'pasif' },
  });

  // Badge tıklama - filtrelenmiş listeye git
  const handleBadgeClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  // Onay bekleyen kampanya sayısı
  const { total: pendingCampaigns } = useGetList('campaigns/requests', {
    pagination: { page: 1, perPage: 1 },
    filter: { status: 'onay_bekliyor' },
  });

  // Onay bekleyen kullanıcı sayısı (is_active=false)
  const { total: pendingUsers } = useGetList('users', {
    pagination: { page: 1, perPage: 1 },
    filter: { is_active: false },
  });

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

          {/* Talepler */}
          <Menu.ResourceItem
            name="creatives/requests"
            leftIcon={<ImageIcon />}
          />

          <Menu.ResourceItem
            name="incentives/requests"
            leftIcon={<CardGiftcardIcon />}
          />

          {/* Kampanyalar - onay bekleyen sayı ile */}
          <Menu.Item
            to={`${basePath}/campaigns/requests`}
            primaryText="Kampanya Talepleri"
            leftIcon={
              <Tooltip 
                title={pendingCampaigns ? `${pendingCampaigns} onay bekleyen kampanya - tıklayın` : ''} 
                arrow 
                placement="right"
              >
                <StyledBadge 
                  badgeContent={pendingCampaigns || 0} 
                  max={99} 
                  invisible={!pendingCampaigns}
                  slotProps={{
                    badge: {
                      onClick: (e: React.MouseEvent) => handleBadgeClick(e, `${basePath}/campaigns/requests?displayedFilters=%7B%22status%22%3Atrue%7D&filter=%7B%22status%22%3A%22onay_bekliyor%22%7D&order=ASC&page=1&perPage=25&sort=id`),
                    },
                  }}
                >
                  <CampaignIcon />
                </StyledBadge>
              </Tooltip>
            }
          />

          <Divider
            sx={{
              margin: open ? '12px 16px' : '12px 8px',
              borderColor: alpha(primaryColor, 0.12),
            }}
          />

          {/* Bayiler - onay bekleyen sayı ile */}
          {(isAdmin || isModerator) && (
            <Menu.Item
              to={`${basePath}/dealers`}
              primaryText="Bayiler"
              leftIcon={
                <Tooltip 
                  title={pendingDealers ? `${pendingDealers} onay bekleyen bayi - tıklayın` : ''} 
                  arrow 
                  placement="right"
                >
                  <StyledBadge 
                    badgeContent={pendingDealers || 0} 
                    max={99} 
                    invisible={!pendingDealers}
                    slotProps={{
                      badge: {
                        onClick: (e: React.MouseEvent) => handleBadgeClick(e, `${basePath}/dealers?displayedFilters=%7B%22status%22%3Atrue%7D&filter=%7B%22status%22%3A%22pasif%22%7D&order=ASC&page=1&perPage=25&sort=id`),
                      },
                    }}
                  >
                    <StoreIcon />
                  </StyledBadge>
                </Tooltip>
              }
            />
          )}

          {/* Kullanıcılar - onay bekleyen sayı ile */}
          {isAdmin && (
            <Menu.Item
              to={`${basePath}/users`}
              primaryText="Kullanıcılar"
              leftIcon={
                <Tooltip 
                  title={pendingUsers ? `${pendingUsers} onay bekleyen kullanıcı - tıklayın` : ''} 
                  arrow 
                  placement="right"
                >
                  <StyledBadge 
                    badgeContent={pendingUsers || 0} 
                    max={99} 
                    invisible={!pendingUsers}
                    slotProps={{
                      badge: {
                        onClick: (e: React.MouseEvent) => handleBadgeClick(e, `${basePath}/users?displayedFilters=%7B%22is_active%22%3Atrue%7D&filter=%7B%22is_active%22%3Afalse%7D&order=ASC&page=1&perPage=25&sort=id`),
                      },
                    }}
                  >
                    <PeopleIcon />
                  </StyledBadge>
                </Tooltip>
              }
            />
          )}

          <Divider
            sx={{
              margin: open ? '12px 16px' : '12px 8px',
              borderColor: alpha(primaryColor, 0.12),
            }}
          />

          {/* Markalar - en altta */}
          {(isAdmin || isModerator) && (
            <Menu.ResourceItem
              name="brands"
              leftIcon={<BrandingWatermarkIcon />}
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
            {brand.name} Bayi Otomasyonu
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
