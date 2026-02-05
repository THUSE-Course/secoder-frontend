import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { ChevronLeftOutlined, ChevronRightOutlined } from '@mui/icons-material';
import type { NavItem } from '../app/navigation';

const drawerWidth = 240;
const drawerCollapsedWidth = 72;

interface SidebarProps {
  navItems: NavItem[];
  activePath: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
  isMobile: boolean;
  open: boolean;
  onToggleOpen: () => void;
}

const SidebarContent: React.FC<{
  navItems: NavItem[];
  activePath: string;
  onItemClick?: () => void;
  open: boolean;
  onToggleOpen: () => void;
}> = ({ navItems, activePath, onItemClick, open, onToggleOpen }) => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? '#f0f0f0' : '#252423',
        color: (theme) =>
          theme.palette.mode === 'light' ? '#605e5c' : '#cdcdcd',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ px: 1.5 }} />
      <List sx={{ px: open ? 1.5 : 1, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => (
          <Tooltip
            key={item.id}
            title={open ? '' : item.label}
            placement="right"
          >
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={activePath === item.path}
              onClick={onItemClick}
              sx={{
                mb: 0.5,
                color: 'text.primary',
                justifyContent: open ? 'flex-start' : 'center',
                '&.Mui-selected': (theme) => ({
                  backgroundColor: '#f2e600',
                  color: theme.palette.mode === 'light' ? '#292827' : '#292827',
                }),
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  minWidth: open ? 36 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Box
        sx={{
          px: open ? 3 : 1.5,
          py: 2.5,
          display: 'flex',
          justifyContent: open ? 'flex-end' : 'center',
        }}
      >
        <Tooltip title={open ? 'Collapse sidebar' : 'Expand sidebar'}>
          <Box
            component="button"
            onClick={onToggleOpen}
            sx={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            {open ? (
              <ChevronLeftOutlined fontSize="medium" />
            ) : (
              <ChevronRightOutlined fontSize="medium" />
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activePath,
  mobileOpen,
  onMobileClose,
  isMobile,
  open,
  onToggleOpen,
}) => {
  return (
    <Box
      component="nav"
      sx={{
        width: { md: open ? drawerWidth : drawerCollapsedWidth },
        flexShrink: { md: 0 },
        height: '100%',
      }}
      aria-label="dashboard navigation"
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : drawerCollapsedWidth,
            border: 'none',
            position: 'initial',
            height: '100%',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
          height: '100%',
        }}
      >
        <SidebarContent
          navItems={navItems}
          activePath={activePath}
          onItemClick={isMobile ? onMobileClose : undefined}
          open={open}
          onToggleOpen={onToggleOpen}
        />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
