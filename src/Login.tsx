import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { post, type LoginResponse } from './utils';
import { useAuth } from './contexts/AuthContext';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToPasswordRecovery?: () => void;
}

const Login: React.FC<LoginProps> = ({
  onSwitchToRegister,
  onSwitchToPasswordRecovery,
}) => {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nextPath = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get('next');
    if (!next) return null;
    if (!next.startsWith('/')) return null;
    if (next.startsWith('//')) return null;
    return next;
  }, [location.search]);

  useEffect(() => {
    if (user) {
      if (user.id === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      navigate(nextPath || '/overview', { replace: true });
    }
  }, [navigate, nextPath, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await post<LoginResponse | string>(
        {
          id: studentId,
          password,
        },
        'login',
      );

      // Store the JWT token and update auth state
      const authToken = typeof result === 'string' ? result : result.token;
      if (authToken) {
        if (studentId === 'admin') {
          await login(authToken, {
            id: 'admin',
            name: 'Admin',
            email: '',
          });
        } else {
          await login(authToken);
        }
      } else {
        throw new Error(t('no_token_received'));
      }
    } catch (err: unknown) {
      const fallbackMessage = t('login_failed');
      const message =
        err instanceof Error && err.message ? err.message : fallbackMessage;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Controls in top-right corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <LanguageSelector />
        <ThemeToggle />
      </Box>

      {/* Login form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          maxWidth: 400,
          margin: 'auto',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {t('login')}
        </Typography>
        <TextField
          label={t('studentId')}
          variant="outlined"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label={t('password')}
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? t('logging_in') : t('login')}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
          {t('no_account')}{' '}
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToRegister();
            }}
          >
            {t('register_here')}
          </Link>
        </Typography>

        {onSwitchToPasswordRecovery && (
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToPasswordRecovery();
              }}
            >
              {t('forgot_password')}
            </Link>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Login;
