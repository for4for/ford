import { useSidebarState } from 'react-admin';
import { Box } from '@mui/material';
import { CustomAppBar } from './CustomAppBar';
import { CustomMenu } from './CustomMenu';

const SIDEBAR_WIDTH_OPEN = 250;
const SIDEBAR_WIDTH_CLOSED = 88;

export const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const [open] = useSidebarState();
  const sidebarWidth = open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <CustomAppBar />
      
      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, pt: '64px' }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            flexShrink: 0,
            transition: 'width 0.2s ease, min-width 0.2s ease',
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 64,
              left: 0,
              width: sidebarWidth,
              height: 'calc(100vh - 64px)',
              transition: 'width 0.2s ease',
              overflowX: 'hidden',
              overflowY: 'auto',
              borderRight: '1px solid #e0e0e0',
              backgroundColor: '#fff',
            }}
          >
            <CustomMenu />
          </Box>
        </Box>

        {/* Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            backgroundColor: '#eef5f9',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
);
};




