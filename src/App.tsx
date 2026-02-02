import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import AuthWrapper from './components/AuthWrapper';
import './i18n/config';

const Dashboard = lazy(() => import('./components/Dashboard'));

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AuthWrapper>
          <Suspense fallback={null}>
            <Dashboard />
          </Suspense>
        </AuthWrapper>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
