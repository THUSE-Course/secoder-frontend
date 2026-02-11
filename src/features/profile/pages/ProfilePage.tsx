import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { editUserInfo, getRbacToken, syncGitlab } from '../../../utils';
import PageHeader from '../../../components/common/PageHeader';
import AlertMessage from '../../../components/common/AlertMessage';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [rbacToken, setRbacToken] = useState<string | null>(null);
  const [rbacVisible, setRbacVisible] = useState(false);
  const [rbacLoading, setRbacLoading] = useState(false);
  const [rbacError, setRbacError] = useState<string | null>(null);
  const [rbacCopied, setRbacCopied] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim();
    const trimmedPassword = editPassword.trim();

    if (!trimmedName && !trimmedEmail && !trimmedPassword) {
      setEditError(
        t(
          'profile_update_no_changes',
          'Please provide at least one field to update.',
        ),
      );
      return;
    }

    if (trimmedPassword && trimmedPassword !== editConfirmPassword) {
      setEditError(t('password_mismatch'));
      return;
    }

    setEditLoading(true);

    try {
      const payload = {
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(trimmedPassword ? { password: trimmedPassword } : {}),
      };

      await editUserInfo(payload);
      updateUser({
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
        ...(trimmedName ? { name: trimmedName } : {}),
      });
      setEditPassword('');
      setEditConfirmPassword('');
      setEditSuccess(t('profile_update_success'));
      window.setTimeout(() => {
        localStorage.clear();
        logout();
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: unknown) {
      const fallbackMessage = t(
        'profile_update_failed',
        'Profile update failed',
      );
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setEditError(message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleRevealToken = async () => {
    setRbacError(null);
    setRbacCopied(false);
    if (!rbacToken) {
      setRbacLoading(true);
      try {
        const token = await getRbacToken();
        setRbacToken(typeof token === 'string' ? token : String(token));
      } catch (err: unknown) {
        const fallbackMessage = t('rbac_token_failed');
        const message =
          err instanceof Error && err.message ? err.message : fallbackMessage;
        setRbacError(message);
      } finally {
        setRbacLoading(false);
      }
    }
    setRbacVisible(true);
  };

  const handleCopyToken = async () => {
    if (!rbacToken) return;
    try {
      await navigator.clipboard.writeText(rbacToken);
      setRbacCopied(true);
    } catch (err: unknown) {
      const fallbackMessage = t('rbac_token_failed');
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setRbacError(message);
    }
  };

  const handleSyncGitlab = async () => {
    setSyncLoading(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      await syncGitlab();
      setSyncSuccess(t('sync_success'));
    } catch (err: unknown) {
      const fallbackMessage = t('sync_failed');
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setSyncError(message);
    } finally {
      setSyncLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <PageHeader
          title={t('edit_profile')}
          subtitle={t(
            'edit_profile_subtitle',
            'Update your name, email, or password.',
          )}
        />

        <Box
          component="form"
          onSubmit={handleProfileSave}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label={t('name')}
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
          />

          <TextField
            label={t('email')}
            variant="outlined"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label={t('new_password')}
            variant="outlined"
            type="password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            fullWidth
          />

          <TextField
            label={t('confirm_new_password')}
            variant="outlined"
            type="password"
            value={editConfirmPassword}
            onChange={(e) => setEditConfirmPassword(e.target.value)}
            fullWidth
            error={
              editConfirmPassword.length > 0 &&
              editPassword !== editConfirmPassword
            }
            helperText={
              editConfirmPassword.length > 0 &&
              editPassword !== editConfirmPassword
                ? t('password_mismatch')
                : ''
            }
          />

          {editError && <AlertMessage severity="error" message={editError} />}

          {editSuccess && (
            <AlertMessage severity="success" message={editSuccess} />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={editLoading}
          >
            {editLoading ? t('saving') : t('save_changes')}
          </Button>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label={t('rbac_token_label')}
            variant="outlined"
            value={
              rbacVisible
                ? rbacToken || ''
                : rbacToken
                  ? t('rbac_token_hidden')
                  : ''
            }
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleRevealToken}
              disabled={rbacLoading}
            >
              {rbacLoading ? t('rbac_token_loading') : t('rbac_token_reveal')}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCopyToken}
              disabled={!rbacToken}
            >
              {t('rbac_token_copy')}
            </Button>
          </Box>
          {rbacError && <AlertMessage severity="error" message={rbacError} />}
          {rbacCopied && (
            <AlertMessage severity="success" message={t('rbac_token_copied')} />
          )}
        </Box>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleSyncGitlab}
            disabled={syncLoading}
          >
            {syncLoading ? t('sync_loading') : t('sync_action')}
          </Button>
          {syncError && <AlertMessage severity="error" message={syncError} />}
          {syncSuccess && (
            <AlertMessage severity="success" message={syncSuccess} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
