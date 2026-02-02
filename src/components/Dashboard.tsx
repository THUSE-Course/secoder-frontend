import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import {
  AccountCircle,
  Email,
  School,
  ExitToApp,
  Launch,
  Code,
  BugReport,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { editUserInfo, validatePassword } from '../utils';

const GroupManagement = lazy(() => import('./GroupManagement'));

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editPasswordErrors, setEditPasswordErrors] = useState<string[]>([]);

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const handleExternalLink = (url: string) => {
    if (url && url !== 'https://example.com') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get external service URLs from environment variables
  const gitlabUrl = import.meta.env.VITE_GITLAB_URL;
  const sonarQubeUrl = import.meta.env.VITE_SONARQUBE_URL;
  const kubernetesUrl = import.meta.env.VITE_KUBERNETES_DASHBOARD_URL;

  if (!user) {
    return null;
  }

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        padding: 2,
      }}
    >
      {/* Header with controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 'bold', color: 'text.secondary' }}
        >
          {t('dashboard', 'Dashboard')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <LanguageSelector />
          <ThemeToggle />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
          >
            {t('logout', 'Logout')}
          </Button>
        </Box>
      </Box>

      {/* User Info Card */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ padding: 3 }}>
            {/* User Avatar and Welcome */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  marginRight: 2,
                  backgroundColor: 'primary.main',
                }}
              >
                <AccountCircle sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {t('welcome', 'Welcome')}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('user_info_subtitle', 'Here is your account information')}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ marginBottom: 3 }} />

            {/* User Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {user.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountCircle color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('name', 'Name')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.name}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <School color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('student_id', 'Student ID')}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.student_id}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('email', 'Email')}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ marginTop: 3, marginBottom: 3 }} />

            {/* External Services */}
            <Box>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 'medium' }}
              >
                {t('secoder_services', 'Services')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Code />}
                  endIcon={<Launch />}
                  onClick={() => handleExternalLink(gitlabUrl)}
                  disabled={!gitlabUrl || gitlabUrl.includes('example.com')}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="body1" component="span">
                      {t('gitlab', 'GitLab')}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="div"
                    >
                      {t('gitlab_desc', 'Source code repository and CI/CD')}
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BugReport />}
                  endIcon={<Launch />}
                  onClick={() => handleExternalLink(sonarQubeUrl)}
                  disabled={
                    !sonarQubeUrl || sonarQubeUrl.includes('example.com')
                  }
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="body1" component="span">
                      {t('sonarqube', 'SonarQube')}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="div"
                    >
                      {t(
                        'sonarqube_desc',
                        'Code quality and security analysis',
                      )}
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DashboardIcon />}
                  endIcon={<Launch />}
                  onClick={() => handleExternalLink(kubernetesUrl)}
                  disabled={
                    !kubernetesUrl || kubernetesUrl.includes('example.com')
                  }
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="body1" component="span">
                      {t('kubernetes_dashboard', 'Kubernetes Dashboard')}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="div"
                    >
                      {t(
                        'kubernetes_desc',
                        'Container orchestration monitoring',
                      )}
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ padding: 3 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'medium' }}
            >
              {t('edit_profile', 'Edit Profile')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                'edit_profile_subtitle',
                'Update your name, email, or password.',
              )}
            </Typography>

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

        {/* Group Management Card */}
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          }
        >
          <GroupManagement />
        </Suspense>
      </Box>
    </Box>
  );
};

export default Dashboard;
