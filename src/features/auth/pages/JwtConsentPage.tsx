import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import AlertMessage from '../../../components/common/AlertMessage';

const REMEMBER_KEY = 'gitlab_jwt_consent';
const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

type RememberRecord = {
  expiresAt: number;
};

const readRememberRecord = (): RememberRecord | null => {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RememberRecord;
    if (!parsed?.expiresAt || typeof parsed.expiresAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeRememberRecord = () => {
  const record: RememberRecord = { expiresAt: Date.now() + FOUR_WEEKS_MS };
  localStorage.setItem(REMEMBER_KEY, JSON.stringify(record));
};

const clearRememberRecord = () => {
  localStorage.removeItem(REMEMBER_KEY);
};

const JwtConsentPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);

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
    if (rememberChoice) {
      writeRememberRecord();
    } else {
      clearRememberRecord();
    }
    setRedirecting(true);
    window.location.assign(callbackUrl);
  };

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login?next=/jwt', { replace: true });
    }
  }, [loading, navigate, token]);

  useEffect(() => {
    if (!callbackUrl || !token) return;
    const record = readRememberRecord();
    if (!record) return;
    if (record.expiresAt < Date.now()) {
      clearRememberRecord();
      return;
    }
    window.location.assign(callbackUrl);
  }, [callbackUrl, token]);

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

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberChoice}
                onChange={(event) => setRememberChoice(event.target.checked)}
              />
            }
            label={t('gitlab_consent_remember')}
          />

          {gitlabUrl && isSignedIn && user?.name && (
            <AlertMessage
              severity="info"
              message={t('gitlab_consent_user', { name: user.name })}
            />
          )}

          {!gitlabUrl && (
            <AlertMessage
              severity="error"
              message={t('gitlab_consent_missing')}
            />
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
