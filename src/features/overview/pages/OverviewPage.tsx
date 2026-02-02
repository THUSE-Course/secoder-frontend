import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import {
  AccountCircle,
  BugReport,
  Code,
  Dashboard as DashboardIcon,
  Email,
  Launch,
  School,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const gitlabUrl = import.meta.env.VITE_GITLAB_URL;
  const sonarQubeUrl = import.meta.env.VITE_SONARQUBE_URL;
  const kubernetesUrl = import.meta.env.VITE_DASHBOARD_URL;
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL;

  const handleExternalLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
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
                disabled={!gitlabUrl}
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
                disabled={!sonarQubeUrl}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                  <Typography variant="body1" component="span">
                    {t('sonarqube')}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="div"
                  >
                    {t('sonarqube_desc')}
                  </Typography>
                </Box>
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<BugReport />}
                endIcon={<Launch />}
                onClick={() => handleExternalLink(grafanaUrl)}
                disabled={!grafanaUrl}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                  <Typography variant="body1" component="span">
                    {t('grafana')}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="div"
                  >
                    {t('grafana_desc')}
                  </Typography>
                </Box>
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<DashboardIcon />}
                endIcon={<Launch />}
                onClick={() => handleExternalLink(kubernetesUrl)}
                disabled={!kubernetesUrl}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                  <Typography variant="body1" component="span">
                    {t('kubernetes')}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="div"
                  >
                    {t('kubernetes_desc')}
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mt: 3, mb: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user.name && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountCircle color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('name', 'Name')}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
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
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverviewPage;
