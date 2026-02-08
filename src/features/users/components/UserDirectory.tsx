import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getUsers } from '../../../utils';
import type { User } from '../../../utils';
import PageHeader from '../../../components/common/PageHeader';

const UserDirectory: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const loadUsers = useCallback(
    async (page?: number) => {
      setLoading(true);
      setError(null);
      try {
        const targetPage = page ?? usersPage;
        const usersData = await getUsers(targetPage, pageSize);
        setUsers(usersData.users || []);
        setUsersTotal(Math.ceil((usersData.users?.length || 0) / pageSize));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [usersPage],
  );

  const handleUsersPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setUsersPage(value);
  };

  useEffect(() => {
    loadUsers(usersPage);
  }, [loadUsers, usersPage]);

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <PageHeader
          title={t('users_directory')}
          actions={
            <Tooltip title={t('refresh')}>
              <IconButton onClick={() => loadUsers()} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>
                      <strong>{t('name')}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t('email')}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t('student_id')}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t('sudo')}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t('group')}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell
                        sx={{
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.sudo ? t('yes') : t('no')}</TableCell>
                      <TableCell>
                        {user.group ? (
                          user.group
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                          >
                            {t('no_group')}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {usersTotal > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Pagination
                  count={usersTotal}
                  page={usersPage}
                  onChange={handleUsersPageChange}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDirectory;
