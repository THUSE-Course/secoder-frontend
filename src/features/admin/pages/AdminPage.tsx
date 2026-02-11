import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  TextField,
  Switch,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  getStatus,
  impersonateUser,
  setReadonlyMode,
  type StatusResponse,
} from '../../../utils';
import { useAuth } from '../../../contexts/AuthContext';
import AlertMessage from '../../../components/common/AlertMessage';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
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

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStatus();
      setStatus(result);
    } catch (err: unknown) {
      const fallbackMessage = t('admin_status_failed');
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

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
      const fallbackMessage = t('admin_readonly_failed');
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
        throw new Error(t('no_token_received'));
      }
      await login(token);
      setImpersonateSuccess(t('admin_impersonate_success'));
    } catch (err: unknown) {
      const fallbackMessage = t('admin_impersonate_failed');
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setImpersonateError(message);
    } finally {
      setImpersonateLoading(false);
    }
  };

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
                    checked={Boolean(status?.readonly)}
                    onChange={handleReadonlyChange}
                    disabled={saving}
                  />
                }
                label={
                  status?.readonly
                    ? t('admin_readonly_on')
                    : t('admin_readonly_off')
                }
              />
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={loadStatus}
                disabled={loading || saving}
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
      </Box>
    </Box>
  );
};

export default AdminPage;
