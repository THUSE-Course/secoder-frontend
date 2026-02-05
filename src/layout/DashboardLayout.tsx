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
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <TopBar
        title={activeItem?.label || t('dashboard')}
        onMenuClick={handleMobileToggle}
        isMobile={isMobile}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          minWidth: 0,
          alignItems: 'stretch',
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
          component="main"
          sx={{
            flex: 1,
            px: 0,
            py: 0,
            width: '100%',
            height: '100vdh',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
