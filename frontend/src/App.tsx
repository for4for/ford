import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';
import { createBrandTheme } from './theme/createBrandTheme';
import { brands, BrandKey } from './config/brands';
import { StaticBrandProvider } from './context/BrandContext';
import { getBrandBasePath } from './utils/brandUtils';
import { CustomLayout } from './layout';
import { DealerLayout } from './layout/dealer';
import { Dashboard } from './dashboard/Dashboard';
import { DealerDashboard } from './dashboard/DealerDashboard';
import { WelcomePage, AdminLogin, DealerLogin, DealerRegister, DealerRegisterSuccess, DealerForgotPassword, DealerResetPassword } from './layout';

// Import icons
import StoreIcon from '@mui/icons-material/Store';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';

// Import resources - Admin
import { DealerList, DealerShow, DealerEdit, DealerCreate } from './resources/dealers';
import { UserList, UserShow, UserEdit, UserCreate } from './resources/users';
import { BrandList, BrandCreate, BrandEdit, BrandShow } from './resources/brands';
import { CreativeRequestList, CreativeRequestShow, CreativeRequestCreate, CreativeRequestEdit } from './resources/creatives';
import { IncentiveRequestList, IncentiveRequestShow, IncentiveRequestCreate, IncentiveRequestEdit } from './resources/incentives';
import { CampaignRequestList, CampaignRequestShow, CampaignRequestCreate, CampaignRequestEdit, CampaignRequestReport, DealerCampaignRequestForm } from './resources/campaigns';

// Import resources - Dealer (also using some backoffice components for show/edit)
import { DealerCreativeRequestCreate } from './resources/creatives';
import { DealerIncentiveRequestCreate, DealerIncentiveRequestEdit } from './resources/incentives';
import { MyRequestsList } from './resources/requests';

// Backoffice Admin - for admin/moderator users
// Dynamic based on brand parameter
const BackofficeAdmin = () => {
  const { brand: brandParam } = useParams<{ brand: string }>();
  
  if (!isValidBrand(brandParam)) {
    return <NotFound />;
  }
  
  const brandConfig = brands[brandParam];
  const basePath = getBrandBasePath(brandParam);
  
  const theme = useMemo(() => createBrandTheme(brandConfig), [brandConfig]);

  return (
    <StaticBrandProvider brandKey={brandParam}>
      <Admin
        basename={`${basePath}/backoffice`}
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        theme={theme}
        layout={CustomLayout}
        dashboard={Dashboard}
        loginPage={false}
        title={brandConfig.titles.backoffice}
        requireAuth
      >
        {(permissions) => [
          // Dealers resource - Admin and Moderator only (not bayi, not creative_agency)
          permissions !== 'bayi' && permissions !== 'creative_agency' ? (
            <Resource 
              key="dealers"
              name="dealers" 
              options={{ label: 'Bayiler' }}
              icon={StoreIcon}
              list={DealerList}
              show={DealerShow}
              edit={DealerEdit}
              create={DealerCreate}
            />
          ) : null,
          // Users resource - Admin only
          permissions === 'admin' ? (
            <Resource 
              key="users"
              name="users" 
              options={{ label: 'Kullanıcılar' }}
              icon={PeopleIcon}
              list={UserList}
              show={UserShow}
              edit={UserEdit}
              create={UserCreate}
            />
          ) : null,
          // Creative requests - Admin, Moderator and Creative Agency can access
          permissions !== 'bayi' ? (
            <Resource 
              key="creatives/requests"
              name="creatives/requests" 
              options={{ label: 'Kreatif Talepleri' }}
              icon={ImageIcon}
              list={CreativeRequestList}
              show={CreativeRequestShow}
              edit={permissions !== 'creative_agency' ? CreativeRequestEdit : undefined}
              create={permissions !== 'creative_agency' ? CreativeRequestCreate : undefined}
            />
          ) : null,
          // Incentive requests - Admin and Moderator only (not bayi, not creative_agency)
          permissions !== 'bayi' && permissions !== 'creative_agency' ? (
            <Resource 
              key="incentives/requests"
              name="incentives/requests" 
              options={{ label: 'Teşvik Talepleri' }}
              icon={CardGiftcardIcon}
              list={IncentiveRequestList}
              show={IncentiveRequestShow}
              edit={IncentiveRequestEdit}
              create={IncentiveRequestCreate}
            />
          ) : null,
          // Campaign requests - Admin and Moderator only (not bayi, not creative_agency)
          permissions !== 'bayi' && permissions !== 'creative_agency' ? (
            <Resource 
              key="campaigns/requests"
              name="campaigns/requests" 
              options={{ label: 'Kampanya Talepleri' }}
              icon={CampaignIcon}
              list={CampaignRequestList}
              show={CampaignRequestShow}
              edit={CampaignRequestEdit}
              create={CampaignRequestCreate}
            />
          ) : null,
          // Brands resource - Admin and Moderator only (en altta)
          permissions !== 'bayi' && permissions !== 'creative_agency' ? (
            <Resource 
              key="brands"
              name="brands" 
              options={{ label: 'Markalar' }}
              icon={BrandingWatermarkIcon}
              list={BrandList}
              show={BrandShow}
              edit={BrandEdit}
              create={BrandCreate}
            />
          ) : null,
        ]}
        <CustomRoutes>
          <Route path="/campaigns/requests/:id/report" element={<CampaignRequestReport />} />
        </CustomRoutes>
      </Admin>
    </StaticBrandProvider>
  );
};

// Dealer Admin - for dealer users
// Dynamic based on brand parameter
const DealerAdmin = () => {
  const { brand: brandParam } = useParams<{ brand: string }>();
  
  if (!isValidBrand(brandParam)) {
    return <NotFound />;
  }
  
  const brandConfig = brands[brandParam];
  const basePath = getBrandBasePath(brandParam);
  
  const theme = useMemo(() => createBrandTheme(brandConfig), [brandConfig]);

  return (
    <StaticBrandProvider brandKey={brandParam}>
      <Admin
        basename={`${basePath}/dealer`}
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        theme={theme}
        layout={DealerLayout}
        dashboard={DealerDashboard}
        loginPage={false}
        title={brandConfig.titles.dealer}
        requireAuth
      >
        <CustomRoutes>
          <Route path="/creative-requests/create" element={<DealerCreativeRequestCreate />} />
          <Route path="/incentive-requests/create" element={<DealerIncentiveRequestCreate />} />
          <Route path="/campaign-requests/create" element={<DealerCampaignRequestForm mode="create" />} />
          <Route path="/requests" element={<MyRequestsList />} />
          <Route path="/creative-requests/:id" element={<CreativeRequestShow />} />
          <Route path="/creative-requests/:id/edit" element={<CreativeRequestEdit />} />
          <Route path="/incentive-requests/:id" element={<IncentiveRequestShow />} />
          <Route path="/incentive-requests/:id/edit" element={<DealerIncentiveRequestEdit />} />
          <Route path="/campaign-requests/:id" element={<CampaignRequestShow />} />
          <Route path="/campaign-requests/:id/edit" element={<DealerCampaignRequestForm mode="edit" />} />
          <Route path="/campaign-requests/:id/report" element={<CampaignRequestReport />} />
        </CustomRoutes>
      </Admin>
    </StaticBrandProvider>
  );
};

// 404 Page
const NotFound = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#f5f5f5'
  }}>
    <h1 style={{ fontSize: '72px', margin: 0, color: '#333' }}>404</h1>
    <p style={{ fontSize: '24px', color: '#666' }}>Sayfa bulunamadı</p>
    <p style={{ color: '#999' }}>Lütfen geçerli bir URL kullanın</p>
  </div>
);

// Brand validation - check if brand is valid
const isValidBrand = (brand: string | undefined): brand is BrandKey => {
  return brand === 'ford' || brand === 'tofas';
};

// Brand index redirect - redirects /:brand to /:brand/login
const BrandIndexRedirect = () => {
  const { brand: brandParam } = useParams<{ brand: string }>();
  
  if (!isValidBrand(brandParam)) {
    return <NotFound />;
  }
  
  const basePath = getBrandBasePath(brandParam);
  return <Navigate to={`${basePath}/login`} replace />;
};

// Brand-specific login wrapper with theme
const BrandLoginWrapper = ({ Component }: { Component: React.ComponentType }) => {
  const { brand: brandParam } = useParams<{ brand: string }>();
  
  if (!isValidBrand(brandParam)) {
    return <NotFound />;
  }
  
  const brandConfig = brands[brandParam];
  const theme = useMemo(() => createBrandTheme(brandConfig), [brandConfig]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StaticBrandProvider brandKey={brandParam}>
        <Component />
      </StaticBrandProvider>
    </ThemeProvider>
  );
};

// Main App - handles routing between portals
const App = () => {
  return (
    <Routes>
      {/* Brand-specific routes */}
      <Route path="/:brand">
        {/* Index - redirect to login */}
        <Route index element={<BrandIndexRedirect />} />
        
        {/* Public Routes */}
        <Route path="login" element={<BrandLoginWrapper Component={WelcomePage} />} />
        <Route path="backoffice-login" element={<BrandLoginWrapper Component={AdminLogin} />} />
        <Route path="dealer-login" element={<BrandLoginWrapper Component={DealerLogin} />} />
        <Route path="dealer-register" element={<BrandLoginWrapper Component={DealerRegister} />} />
        <Route path="dealer-register-success" element={<BrandLoginWrapper Component={DealerRegisterSuccess} />} />
        <Route path="dealer-forgot-password" element={<BrandLoginWrapper Component={DealerForgotPassword} />} />
        <Route path="dealer-reset-password" element={<BrandLoginWrapper Component={DealerResetPassword} />} />
        
        {/* Backoffice Portal - Admin/Moderator */}
        <Route path="backoffice/*" element={<BackofficeAdmin />} />
        
        {/* Dealer Portal */}
        <Route path="dealer/*" element={<DealerAdmin />} />
      </Route>
      
      {/* Root - show 404 (no default brand) */}
      <Route path="/" element={<NotFound />} />
      
      {/* Catch all - 404 for any invalid route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
