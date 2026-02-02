import { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import Login from '../Login';
import Register from '../Register';

const OverviewPage = lazy(
  () => import('../features/overview/pages/OverviewPage'),
);
const UsersPage = lazy(() => import('../features/users/pages/UsersPage'));
const GroupsPage = lazy(() => import('../features/groups/pages/GroupsPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
    <CircularProgress />
  </Box>
);

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  return <Login onSwitchToRegister={() => navigate('/register')} />;
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const RegisterRoute = () => {
    const navigate = useNavigate();
    return <Register onSwitchToLogin={() => navigate('/login')} />;
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
