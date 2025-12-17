import { LayoutProps } from 'react-admin';
import { Box } from '@mui/material';
import { DealerAppBar } from './DealerAppBar';
import { DealerBottomNav } from './DealerBottomNav';

export const DealerLayout = (props: LayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <DealerAppBar />
      
      <Box
        component="main"
        sx={{
          flex: 1,
          maxWidth: '640px',
          width: '100%',
          margin: '0 auto',
          paddingTop: '56px', // AppBar height
          paddingBottom: '56px', // BottomNav height
          overflowY: 'auto',
        }}
      >
        {props.children}
      </Box>
      
      <DealerBottomNav />
    </Box>
  );
};

