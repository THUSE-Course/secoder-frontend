import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './app/routes';
import './i18n/config';

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
