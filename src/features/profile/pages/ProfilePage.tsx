import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { editUserInfo, validatePassword } from '../../../utils';
import PageHeader from '../../../components/common/PageHeader';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editPasswordErrors, setEditPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const handleEditPasswordChange = (value: string) => {
    setEditPassword(value);
    const validation = validatePassword(value);
    setEditPasswordErrors(validation.errors);
  };

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

    if (trimmedPassword) {
      const passwordValidation = validatePassword(trimmedPassword);
      if (!passwordValidation.isValid) {
        setEditError(
          t(
            'password_validation_failed',
            'Password does not meet requirements',
          ),
        );
        return;
      }

      if (trimmedPassword !== editConfirmPassword) {
        setEditError(t('password_mismatch', 'Passwords do not match'));
        return;
      }
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
      setEditPasswordErrors([]);
      setEditSuccess(
        t('profile_update_success', 'Your profile has been updated.'),
      );
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

  if (!user) {
    return null;
  }

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <PageHeader
          title={t('edit_profile', 'Edit Profile')}
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
            label={t('name', 'Name')}
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
          />

          <TextField
            label={t('email', 'Email')}
            variant="outlined"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label={t('new_password', 'New Password')}
            variant="outlined"
            type="password"
            value={editPassword}
            onChange={(e) => handleEditPasswordChange(e.target.value)}
            fullWidth
            error={editPassword.length > 0 && editPasswordErrors.length > 0}
            helperText={
              editPassword.length > 0 && editPasswordErrors.length > 0
                ? t('password_requirements_not_met')
                : t(
                    'password_requirements',
                    'At least 8 characters with 3 types: uppercase, lowercase, numbers, symbols',
                  )
            }
          />

          <TextField
            label={t('confirm_new_password', 'Confirm New Password')}
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
                ? t('password_mismatch', 'Passwords do not match')
                : ''
            }
          />

          {editError && <Alert severity="error">{editError}</Alert>}

          {editSuccess && <Alert severity="success">{editSuccess}</Alert>}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={editLoading}
          >
            {editLoading
              ? t('saving', 'Saving...')
              : t('save_changes', 'Save Changes')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
