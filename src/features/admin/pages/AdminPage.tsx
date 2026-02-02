import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%', height: '100%', p: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        Admin
      </Typography>
    </Box>
  );
};

export default AdminPage;
