import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      if (!localStorage.getItem('theme')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode colors
                primary: {
                  main: '#414141',
                },
                secondary: {
                  main: '#eff2f5',
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#f0f0f0',
                },
                text: {
                  primary: '#44444f',
                  secondary: '#605e5c',
                },
              }
            : {
                // Dark mode colors
                primary: {
                  main: '#ffffff',
                },
                secondary: {
                  main: '#1b1a19',
                },
                background: {
                  default: '#292827',
                  paper: '#313131',
                },
                text: {
                  primary: '#faf9f8',
                  secondary: '#cdcdcd',
                },
              }),
        },
        typography: {
          fontFamily:
            '"Space Grotesk", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          subtitle1: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: { borderRadius: 6 },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.3s ease, color 0.3s ease',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                border: '1px solid rgba(0, 0, 0, 0.08)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
