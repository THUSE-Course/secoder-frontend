import React from 'react';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExitToApp,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  onMenuClick,
  isMobile,
  isSidebarOpen,
}) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: (theme) =>
          theme.palette.mode === 'light' ? '#f0f0f0' : '#252423',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton onClick={onMenuClick} color="inherit">
          {isMobile ? (
            <MenuIcon />
          ) : isSidebarOpen ? (
            <ChevronLeft />
          ) : (
            <ChevronRight />
          )}
        </IconButton>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            SECoder
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageSelector />
          <ThemeToggle />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ExitToApp />}
            onClick={logout}
          >
            {t('logout')}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
