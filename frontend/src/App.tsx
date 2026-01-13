import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Routes, Route, Navigate } from 'react-router-dom';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';
import { theme } from './theme';
import { CustomLayout } from './layout';
import { DealerLayout } from './layout/dealer';
import { Dashboard } from './dashboard/Dashboard';
import { DealerDashboard } from './dashboard/DealerDashboard';
import { WelcomePage, AdminLogin, DealerLogin, DealerRegister, DealerForgotPassword, DealerResetPassword } from './layout';

// Import icons
import StoreIcon from '@mui/icons-material/Store';
import ImageIcon from '@mui/icons-material/Image';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';

// Import resources - Admin
import { DealerList, DealerShow, DealerEdit, DealerCreate } from './resources/dealers';
import { UserList, UserShow, UserEdit, UserCreate } from './resources/users';
import { CreativeRequestList, CreativeRequestShow, CreativeRequestCreate, CreativeRequestEdit } from './resources/creatives';
import { IncentiveRequestList, IncentiveRequestShow, IncentiveRequestCreate, IncentiveRequestEdit } from './resources/incentives';
import { CampaignRequestList, CampaignRequestShow, CampaignRequestCreate, CampaignRequestEdit, CampaignRequestReport, DealerCampaignRequestForm } from './resources/campaigns';

// Import resources - Dealer (also using some backoffice components for show/edit)
import { DealerCreativeRequestCreate } from './resources/creatives';
import { DealerIncentiveRequestCreate, DealerIncentiveRequestEdit } from './resources/incentives';
import { MyRequestsList } from './resources/requests';

// Backoffice Admin - for admin/moderator users
// All routes will be prefixed with /backoffice
const BackofficeAdmin = () => (
  <Admin
    basename="/backoffice"
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    theme={theme}
    layout={CustomLayout}
    dashboard={Dashboard}
    loginPage={false}
    title="Ford Backoffice"
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
    ]}
    <CustomRoutes>
      <Route path="/campaigns/requests/:id/report" element={<CampaignRequestReport />} />
    </CustomRoutes>
  </Admin>
);

// Dealer Admin - for dealer users
// All routes will be prefixed with /dealer
const DealerAdmin = () => (
  <Admin
    basename="/dealer"
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    theme={theme}
    layout={DealerLayout}
    dashboard={DealerDashboard}
    loginPage={false}
    title="Tofaş Bayi Portalı"
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
);

// Main App - handles routing between portals
const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<WelcomePage />} />
      <Route path="/backoffice-login" element={<AdminLogin />} />
      <Route path="/dealer-login" element={<DealerLogin />} />
      <Route path="/dealer-register" element={<DealerRegister />} />
      <Route path="/dealer-forgot-password" element={<DealerForgotPassword />} />
      <Route path="/dealer-reset-password" element={<DealerResetPassword />} />
      
      {/* Backoffice Portal - Admin/Moderator */}
      <Route path="/backoffice/*" element={<BackofficeAdmin />} />
      
      {/* Dealer Portal */}
      <Route path="/dealer/*" element={<DealerAdmin />} />
      
      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
