import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import GroupManagement from './GroupManagement';
import { AccountCircle, Email, School, ExitToApp, Launch, Code, BugReport, Dashboard as DashboardIcon } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

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
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
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
              <Typography variant="h6" component="h3" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
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
                    <Typography variant="body2" color="text.secondary" component="div">
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
                  disabled={!sonarQubeUrl || sonarQubeUrl.includes('example.com')}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="body1" component="span">
                      {t('sonarqube', 'SonarQube')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {t('sonarqube_desc', 'Code quality and security analysis')}
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DashboardIcon />}
                  endIcon={<Launch />}
                  onClick={() => handleExternalLink(kubernetesUrl)}
                  disabled={!kubernetesUrl || kubernetesUrl.includes('example.com')}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="body1" component="span">
                      {t('kubernetes_dashboard', 'Kubernetes Dashboard')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {t('kubernetes_desc', 'Container orchestration monitoring')}
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Group Management Card */}
        <GroupManagement />
      </Box>
    </Box>
  );
};

export default Dashboard;
