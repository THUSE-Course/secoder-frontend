import { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import Login from '../Login';
import Register from '../Register';
import PasswordRecovery from '../PasswordRecovery';
import PasswordRecoveryConfirm from '../PasswordRecoveryConfirm';

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
  const LoginRoute = () => {
    const navigate = useNavigate();
    return (
      <Login
        onSwitchToRegister={() => navigate('/register')}
        onSwitchToPasswordRecovery={() => navigate('/password-recovery')}
      />
    );
  };

  const RegisterRoute = () => {
    const navigate = useNavigate();
    return <Register onSwitchToLogin={() => navigate('/login')} />;
  };

  const PasswordRecoveryRoute = () => {
    const navigate = useNavigate();
    return <PasswordRecovery onSwitchToLogin={() => navigate('/login')} />;
  };

  const PasswordRecoveryConfirmRoute = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    return (
      <PasswordRecoveryConfirm
        onSwitchToLogin={() => navigate('/login')}
        token={params.get('token') || undefined}
      />
    );
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route
            path="/password-recovery"
            element={<PasswordRecoveryRoute />}
          />
          <Route
            path="/password-recovery/confirm"
            element={<PasswordRecoveryConfirmRoute />}
          />

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
