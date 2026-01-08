import { Layout, LayoutProps } from 'react-admin';
import { CustomAppBar } from './CustomAppBar';
import { CustomMenu } from './CustomMenu';

// Sidebar genişlikleri
const SIDEBAR_WIDTH_OPEN = 250;
const SIDEBAR_WIDTH_CLOSED = 80;

export const CustomLayout = (props: LayoutProps) => (
  <Layout 
    {...props} 
    appBar={CustomAppBar} 
    menu={CustomMenu}
    sx={{
      // React-Admin Sidebar override
      '& .RaSidebar-fixed': {
        width: SIDEBAR_WIDTH_CLOSED,
        '&.RaSidebar-open': {
          width: SIDEBAR_WIDTH_OPEN,
        },
      },
      '& .RaSidebar-docked': {
        width: SIDEBAR_WIDTH_CLOSED,
        '&.RaSidebar-open': {
          width: SIDEBAR_WIDTH_OPEN,
        },
      },
      '& .MuiDrawer-root': {
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH_CLOSED,
          transition: 'width 0.2s ease',
        },
        '&.RaSidebar-open .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH_OPEN,
        },
      },
      // Content alanı margin ayarı
      '& .RaLayout-content': {
        marginLeft: 0,
        transition: 'margin-left 0.2s ease',
      },
    }}
  />
);




