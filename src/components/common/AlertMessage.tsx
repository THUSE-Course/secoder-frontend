import React, { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import type { SxProps, Theme } from '@mui/material/styles';

type AlertMessageProps = {
  severity: AlertColor;
  message: React.ReactNode;
  onClose?: () => void;
  sx?: SxProps<Theme>;
};

const AlertMessageInner: React.FC<AlertMessageProps> = ({
  severity,
  message,
  onClose,
  sx,
}) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={severity} onClose={handleClose} sx={sx}>
        {message}
      </Alert>
    </Snackbar>
  );
};

const AlertMessage: React.FC<AlertMessageProps> = (props) => {
  const key = `${props.severity}:${String(props.message)}`;
  return <AlertMessageInner key={key} {...props} />;
};

export default AlertMessage;
