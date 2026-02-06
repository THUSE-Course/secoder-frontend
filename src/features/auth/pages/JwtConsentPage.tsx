import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const JwtConsentPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  const gitlabUrl = import.meta.env.VITE_GITLAB_URL as string | undefined;

  const callbackUrl = useMemo(() => {
    if (!gitlabUrl || !token) return null;
    try {
      const url = new URL('/users/auth/jwt/callback', gitlabUrl);
      url.searchParams.set('jwt', token);
      return url.toString();
    } catch {
      return null;
    }
  }, [gitlabUrl, token]);

  const handleApprove = () => {
    if (!callbackUrl) return;
    setRedirecting(true);
    window.location.assign(callbackUrl);
  };

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login?next=/jwt', { replace: true });
    }
  }, [loading, navigate, token]);

  if (loading || !token) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isSignedIn = Boolean(token);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" component="h1">
            {t('gitlab_consent_title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('gitlab_consent_body')}
          </Typography>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('gitlab_consent_shared_title')}
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Box component="li">
                <Typography variant="body2" color="text.secondary">
                  {t('gitlab_consent_shared_id')}: {user?.id || '-'}
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2" color="text.secondary">
                  {t('gitlab_consent_shared_email')}: {user?.email || '-'}
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2" color="text.secondary">
                  {t('gitlab_consent_shared_name')}: {user?.name || '-'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {gitlabUrl && isSignedIn && user?.name && (
            <Alert severity="info">
              {t('gitlab_consent_user', { name: user.name })}
            </Alert>
          )}

          {!gitlabUrl && (
            <Alert severity="error">{t('gitlab_consent_missing')}</Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApprove}
              disabled={!callbackUrl || !isSignedIn || redirecting}
            >
              {redirecting
                ? t('gitlab_consent_redirecting')
                : t('gitlab_consent_approve')}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/overview')}
            >
              {t('gitlab_consent_cancel')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default JwtConsentPage;
