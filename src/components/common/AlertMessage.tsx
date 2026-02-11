import React from 'react';
import { Alert } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import type { SxProps, Theme } from '@mui/material/styles';

type AlertMessageProps = {
  severity: AlertColor;
  message: React.ReactNode;
  onClose?: () => void;
  sx?: SxProps<Theme>;
};

const AlertMessage: React.FC<AlertMessageProps> = ({
  severity,
  message,
  onClose,
  sx,
}) => {
  return (
    <Alert severity={severity} onClose={onClose} sx={sx}>
      {message}
    </Alert>
  );
};

export default AlertMessage;
