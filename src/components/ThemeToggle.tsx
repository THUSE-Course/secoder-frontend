import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();
  const { t } = useTranslation();

  return (
    <Tooltip title={t(mode === 'light' ? 'switch_to_dark_mode' : 'switch_to_light_mode')}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        sx={{
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
