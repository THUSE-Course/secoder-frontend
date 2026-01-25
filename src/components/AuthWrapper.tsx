import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import Login from '../Login';
import Register from '../Register';
import PasswordRecovery from '../PasswordRecovery';
import PasswordRecoveryConfirm from '../PasswordRecoveryConfirm';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'passwordRecovery' | 'passwordRecoveryConfirm'>(() => {
    const path = window.location.pathname;
    if (path === '/PasswordRecovery') {
      return 'passwordRecovery';
    }
    if (path === '/PasswordRecoveryConfirm') {
      return 'passwordRecoveryConfirm';
    }
    return 'login';
  });
  const [recoveryToken] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path === '/PasswordRecoveryConfirm') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('token');
    }
    return null;
  });

  // Function to navigate to different views
  const navigateToView = (view: 'login' | 'register' | 'passwordRecovery' | 'passwordRecoveryConfirm') => {
    setCurrentView(view);

    // Update URL without page reload
    if (view === 'passwordRecovery') {
      window.history.pushState({}, '', '/PasswordRecovery');
    } else if (view === 'passwordRecoveryConfirm') {
      // This should typically be accessed via a link with token, but handle navigation
      window.history.pushState({}, '', '/PasswordRecoveryConfirm');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is not logged in, show appropriate auth view
  if (!user) {
    switch (currentView) {
      case 'register':
        return <Register onSwitchToLogin={() => navigateToView('login')} />;
      case 'passwordRecovery':
        return <PasswordRecovery onSwitchToLogin={() => navigateToView('login')} />;
      case 'passwordRecoveryConfirm':
        return <PasswordRecoveryConfirm onSwitchToLogin={() => navigateToView('login')} token={recoveryToken || undefined} />;
      default:
        return (
          <Login
            onSwitchToRegister={() => navigateToView('register')}
            onSwitchToPasswordRecovery={() => navigateToView('passwordRecovery')}
          />
        );
    }
  }

  // If user is logged in, render children (dashboard)
  return <>{children}</>;
};

export default AuthWrapper;
