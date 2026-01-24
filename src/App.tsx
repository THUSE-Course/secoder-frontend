import { AuthProvider } from "./contexts/AuthContext";
import { CustomThemeProvider } from "./contexts/ThemeContext";
import AuthWrapper from "./components/AuthWrapper";
import Dashboard from "./components/Dashboard";
import "./i18n/config";

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AuthWrapper>
          <Dashboard />
        </AuthWrapper>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
