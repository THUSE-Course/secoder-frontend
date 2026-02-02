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
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getUsers } from '../../../utils';
import type { User } from '../../../utils';

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
    <Card sx={{ width: '100%', boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon color="primary" />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {t('users_directory', 'Users Directory')}
            </Typography>
          </Box>
          <Tooltip title={t('refresh', 'Refresh')}>
            <IconButton onClick={() => loadUsers()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

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
                      <strong>{t('name', 'Name')}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t('student_id', 'Student ID')}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t('group', 'Group')}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.student_id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.student_id}</TableCell>
                      <TableCell>
                        {user.group ? (
                          user.group
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                          >
                            {t('no_group', 'No group')}
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
