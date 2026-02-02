import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { post, validatePassword } from './utils';
import type { RegisterPayload } from './utils';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePassword(value);
    setPasswordErrors(validation.errors);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        setError(t('name_required'));
        return;
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(
          t(
            'password_validation_failed',
            'Password does not meet requirements',
          ),
        );
        return;
      }

      // Check password confirmation
      if (password !== confirmPassword) {
        setError(t('password_mismatch'));
        return;
      }

      const payload: RegisterPayload = {
        name: name.trim(),
        student_id: studentId,
        email: email,
        password,
      };

      await post(payload, 'register');
      setSuccess(
        t(
          'registration_success',
          'Registration successful! You can now log in.',
        ),
      );

      // Clear form
      setName('');
      setStudentId('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPasswordErrors([]);
    } catch (err: unknown) {
      const fallbackMessage = t('registration_failed');
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
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        padding: 2,
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

      {/* Register form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          maxWidth: 500,
          margin: 'auto',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {t('register')}
        </Typography>

        <TextField
          label={t('name')}
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label={t('student_id')}
          variant="outlined"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          fullWidth
          helperText={t('student_id_help')}
        />

        <TextField
          label={t('email')}
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          helperText={t('email_help')}
        />

        <TextField
          label={t('password')}
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
          fullWidth
          error={passwordErrors.length > 0 && password.length > 0}
          helperText={
            password.length > 0 && passwordErrors.length > 0
              ? t('password_requirements_not_met')
              : t(
                  'password_requirements',
                  'At least 8 characters with 3 types: uppercase, lowercase, numbers, symbols',
                )
          }
        />

        {password.length > 0 && passwordErrors.length > 0 && (
          <Box sx={{ width: '100%' }}>
            {passwordErrors.map((error, index) => (
              <Chip
                key={index}
                label={error}
                color="error"
                size="small"
                sx={{ margin: 0.5, fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}

        <TextField
          label={t('confirm_password')}
          variant="outlined"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          error={confirmPassword.length > 0 && password !== confirmPassword}
          helperText={
            confirmPassword.length > 0 && password !== confirmPassword
              ? t('password_mismatch')
              : ''
          }
        />

        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={
            loading || passwordErrors.length > 0 || password !== confirmPassword
          }
        >
          {loading ? t('registering') : t('register')}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
          {t('already_have_account')}{' '}
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
          >
            {t('login_here')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
