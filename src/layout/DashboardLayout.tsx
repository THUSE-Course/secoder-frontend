import React, { useMemo, useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { buildNavItems } from '../app/navigation';

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = useMemo(() => buildNavItems(t), [t]);
  const activeItem = navItems.find((item) =>
    location.pathname.startsWith(item.path),
  );

  const handleMobileToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Sidebar
        navItems={navItems}
        activePath={activeItem?.path || '/overview'}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
        isMobile={isMobile}
        open={sidebarOpen}
        onToggleOpen={handleSidebarToggle}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
          backgroundColor: 'background.default',
        }}
      >
        <TopBar
          title={activeItem?.label || t('dashboard', 'Dashboard')}
          onMenuClick={isMobile ? handleMobileToggle : handleSidebarToggle}
          isMobile={isMobile}
          isSidebarOpen={sidebarOpen}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 4 },
            width: '100%',
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
