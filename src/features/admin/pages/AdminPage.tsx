import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Pagination,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  addAdminUser,
  banAdminUser,
  getAdminUsers,
  getStatus,
  impersonateUser,
  setReadonlyMode,
  type AdminUserAccess,
  type StatusResponse,
} from '../../../utils';
import { useAuth } from '../../../contexts/AuthContext';
import AlertMessage from '../../../components/common/AlertMessage';

const ADMIN_USERS_PAGE_SIZE = 10;

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, user: currentUser } = useAuth();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [impersonateId, setImpersonateId] = useState('');
  const [impersonateLoading, setImpersonateLoading] = useState(false);
  const [impersonateError, setImpersonateError] = useState<string | null>(null);
  const [impersonateSuccess, setImpersonateSuccess] = useState<string | null>(
    null,
  );
  const [adminUsers, setAdminUsers] = useState<AdminUserAccess[]>([]);
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const [adminUsersTotal, setAdminUsersTotal] = useState(0);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersSaving, setAdminUsersSaving] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);
  const [adminUsersSuccess, setAdminUsersSuccess] = useState<string | null>(
    null,
  );
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<AdminUserAccess | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStatus();
      setStatus(result);
    } catch (err: unknown) {
      const fallbackMessage = 'Unable to load status';
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdminUsers = useCallback(
    async (page?: number) => {
      setAdminUsersLoading(true);
      setAdminUsersError(null);
      try {
        const targetPage = page ?? adminUsersPage;
        const result = await getAdminUsers(targetPage, ADMIN_USERS_PAGE_SIZE);
        setAdminUsers(result.users || []);
        setAdminUsersTotal(
          Math.ceil((result.total || 0) / ADMIN_USERS_PAGE_SIZE),
        );
      } catch (err: unknown) {
        const fallbackMessage = 'Unable to load user access list';
        const message =
          err instanceof Error && err.message ? err.message : fallbackMessage;
        setAdminUsersError(message);
      } finally {
        setAdminUsersLoading(false);
      }
    },
    [adminUsersPage],
  );

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    loadAdminUsers(adminUsersPage);
  }, [loadAdminUsers, adminUsersPage]);

  const handleReadonlyChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!status) return;
    const nextValue = event.target.checked;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setReadonlyMode(nextValue);
      setStatus({ ...status, readonly: nextValue });
      setSuccess(t('admin_readonly_updated'));
    } catch (err: unknown) {
      const fallbackMessage = 'Unable to update read-only setting';
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleImpersonate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetId = impersonateId.trim();
    if (!targetId) {
      setImpersonateError(t('admin_impersonate_required'));
      return;
    }
    setImpersonateLoading(true);
    setImpersonateError(null);
    setImpersonateSuccess(null);
    try {
      const result = await impersonateUser(targetId);
      const token = typeof result === 'string' ? result : result.token;
      if (!token) {
        throw new Error('No token received');
      }
      await login(token);
      setImpersonateSuccess(t('admin_impersonate_success'));
    } catch (err: unknown) {
      const fallbackMessage = 'Unable to impersonate user';
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setImpersonateError(message);
    } finally {
      setImpersonateLoading(false);
    }
  };

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = newUserId.trim();
    const password = newUserPassword.trim();
    if (!id || !password) {
      setAdminUsersError(t('admin_user_access_required'));
      return;
    }
    setAdminUsersSaving(true);
    setAdminUsersError(null);
    setAdminUsersSuccess(null);
    try {
      await addAdminUser(id, password);
      setAdminUsersSuccess(t('admin_user_access_added'));
      setNewUserId('');
      setNewUserPassword('');
      setAdminUsersPage(1);
      await loadAdminUsers(1);
    } catch (err: unknown) {
      const fallbackMessage = 'Unable to update user access';
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setAdminUsersError(message);
    } finally {
      setAdminUsersSaving(false);
    }
  };

  const handleBanUser = async () => {
    if (!banTarget) return;
    setAdminUsersSaving(true);
    setAdminUsersError(null);
    setAdminUsersSuccess(null);
    try {
      await banAdminUser(banTarget.id);
      setAdminUsersSuccess(t('admin_user_access_banned'));
      setBanDialogOpen(false);
      setBanTarget(null);
      await loadAdminUsers();
    } catch (err: unknown) {
      const fallbackMessage = 'Unable to ban user';
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setAdminUsersError(message);
    } finally {
      setAdminUsersSaving(false);
    }
  };

  const handleAdminUsersPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setAdminUsersPage(value);
  };

  const readonly = Boolean(status?.readonly);

  return (
    <Box sx={{ width: '100%', height: '100%', p: 3 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        {t('admin_title')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card sx={{ width: '100%' }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography variant="h6">{t('admin_readonly_title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('admin_readonly_desc')}
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={readonly}
                    onChange={handleReadonlyChange}
                    disabled={saving}
                  />
                }
                label={
                  readonly ? t('admin_readonly_on') : t('admin_readonly_off')
                }
              />
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={loadStatus}
                disabled={loading || saving}
                startIcon={<RefreshIcon />}
              >
                {t('refresh')}
              </Button>
            </Box>

            {error && <AlertMessage severity="error" message={error} />}
            {success && <AlertMessage severity="success" message={success} />}
          </CardContent>
        </Card>

        <Card sx={{ width: '100%' }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography variant="h6">{t('admin_impersonate_title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('admin_impersonate_desc')}
            </Typography>

            <Box component="form" onSubmit={handleImpersonate}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  label={t('studentId')}
                  value={impersonateId}
                  onChange={(event) => setImpersonateId(event.target.value)}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={impersonateLoading}
                >
                  {impersonateLoading
                    ? t('admin_impersonate_loading')
                    : t('admin_impersonate_action')}
                </Button>
              </Box>
            </Box>

            {impersonateError && (
              <AlertMessage severity="error" message={impersonateError} />
            )}
            {impersonateSuccess && (
              <AlertMessage severity="success" message={impersonateSuccess} />
            )}
          </CardContent>
        </Card>

        <Card sx={{ width: '100%' }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6">
                  {t('admin_user_access_title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin_user_access_desc')}
                </Typography>
              </Box>
              <Tooltip title={t('refresh')}>
                <span>
                  <IconButton
                    onClick={() => loadAdminUsers()}
                    disabled={adminUsersLoading}
                    color="primary"
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Box component="form" onSubmit={handleAddUser}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  label={t('studentId')}
                  value={newUserId}
                  onChange={(event) => setNewUserId(event.target.value)}
                  size="small"
                  disabled={readonly || adminUsersSaving}
                />
                <TextField
                  label={t('admin_user_initial_password')}
                  value={newUserPassword}
                  onChange={(event) => setNewUserPassword(event.target.value)}
                  size="small"
                  type="password"
                  disabled={readonly || adminUsersSaving}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={readonly || adminUsersSaving}
                  startIcon={<AddIcon />}
                >
                  {adminUsersSaving ? t('saving') : t('admin_user_add_action')}
                </Button>
              </Box>
            </Box>

            {adminUsersError && (
              <AlertMessage severity="error" message={adminUsersError} />
            )}
            {adminUsersSuccess && (
              <AlertMessage severity="success" message={adminUsersSuccess} />
            )}

            {adminUsersLoading ? (
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
                          <strong>{t('student_id')}</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{t('name')}</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{t('email')}</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{t('admin_user_registered')}</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{t('admin_user_access_status')}</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{t('group')}</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{t('actions')}</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {adminUsers.map((user) => {
                        const banDisabled =
                          readonly ||
                          user.banned ||
                          user.sudo ||
                          user.id === currentUser?.id ||
                          adminUsersSaving;
                        return (
                          <TableRow key={user.id} hover>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.name || '-'}</TableCell>
                            <TableCell>{user.email || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  user.registered
                                    ? t('admin_user_registered_yes')
                                    : t('admin_user_registered_no')
                                }
                                color={user.registered ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  user.banned
                                    ? t('admin_user_banned')
                                    : t('admin_user_allowed')
                                }
                                color={user.banned ? 'error' : 'primary'}
                              />
                            </TableCell>
                            <TableCell>{user.group || '-'}</TableCell>
                            <TableCell align="right">
                              <Tooltip title={t('admin_user_ban_action')}>
                                <span>
                                  <IconButton
                                    color="error"
                                    disabled={banDisabled}
                                    onClick={() => {
                                      setBanTarget(user);
                                      setBanDialogOpen(true);
                                    }}
                                  >
                                    <BlockIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {adminUsersTotal > 1 && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}
                  >
                    <Pagination
                      count={adminUsersTotal}
                      page={adminUsersPage}
                      onChange={handleAdminUsersPageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={banDialogOpen}
        onClose={() => setBanDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('admin_user_ban_action')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('admin_user_ban_confirm', { id: banTarget?.id || '' })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>{t('cancel')}</Button>
          <Button
            onClick={handleBanUser}
            variant="contained"
            color="error"
            disabled={adminUsersSaving}
          >
            {adminUsersSaving ? (
              <CircularProgress size={24} />
            ) : (
              t('admin_user_ban_action')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
