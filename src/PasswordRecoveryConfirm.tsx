import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Link, Alert, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { post, hashPassword, validatePassword, type ConfirmPasswordRecoveryPayload } from "./utils";
import ThemeToggle from "./components/ThemeToggle";
import LanguageSelector from "./components/LanguageSelector";

interface PasswordRecoveryConfirmProps {
  onSwitchToLogin: () => void;
  token?: string;
}

const PasswordRecoveryConfirm: React.FC<PasswordRecoveryConfirmProps> = ({
  onSwitchToLogin,
  token
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(token || null);

  useEffect(() => {
    // Extract token from URL if not provided as prop
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      setTokenFromUrl(urlToken);
    }
  }, [token]);

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
      // Check if token is available
      if (!tokenFromUrl) {
        setError(t("invalid_token", "Invalid or missing recovery token"));
        return;
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(t("password_validation_failed", "Password does not meet requirements"));
        return;
      }

      // Check password confirmation
      if (password !== confirmPassword) {
        setError(t("password_mismatch", "Passwords do not match"));
        return;
      }

      // Hash the password before sending
      const hashedPassword = await hashPassword(password);

      const payload: ConfirmPasswordRecoveryPayload = {
        token: tokenFromUrl,
        newPassword: hashedPassword
      };

      await post(payload, "recover_password/confirm");
      setSuccess(t("password_reset_success", "Password has been successfully reset! You can now log in with your new password."));

      // Clear form
      setPassword("");
      setConfirmPassword("");
      setPasswordErrors([]);

    } catch (err: any) {
      setError(err.message || t("password_reset_failed", "Password reset failed"));
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token is available
  if (!tokenFromUrl) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Controls in top-right corner */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <LanguageSelector />
          <ThemeToggle />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "100%",
            maxWidth: 400,
            margin: "auto",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            {t("password_reset", "Password Reset")}
          </Typography>

          <Alert severity="error" sx={{ width: "100%" }}>
            {t("invalid_token", "Invalid or missing recovery token")}
          </Alert>

          <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin();
              }}
            >
              {t("back_to_login", "Back to Login")}
            </Link>
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        padding: 2,
      }}
    >
      {/* Controls in top-right corner */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        <LanguageSelector />
        <ThemeToggle />
      </Box>

      {/* Password reset form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          width: "100%",
          maxWidth: 400,
          margin: "auto",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {t("password_reset", "Password Reset")}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 2 }}>
          {t("password_reset_instructions", "Enter your new password below.")}
        </Typography>

        <TextField
          label={t("new_password", "New Password")}
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
          fullWidth
          error={passwordErrors.length > 0 && password.length > 0}
          helperText={
            password.length > 0 && passwordErrors.length > 0
              ? t("password_requirements_not_met")
              : t("password_requirements", "At least 8 characters with 3 types: uppercase, lowercase, numbers, symbols")
          }
        />

        {password.length > 0 && passwordErrors.length > 0 && (
          <Box sx={{ width: "100%" }}>
            {passwordErrors.map((error, index) => (
              <Chip
                key={index}
                label={error}
                color="error"
                size="small"
                sx={{ margin: 0.5, fontSize: "0.75rem" }}
              />
            ))}
          </Box>
        )}

        <TextField
          label={t("confirm_new_password", "Confirm New Password")}
          variant="outlined"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          error={confirmPassword.length > 0 && password !== confirmPassword}
          helperText={
            confirmPassword.length > 0 && password !== confirmPassword
              ? t("password_mismatch", "Passwords do not match")
              : ""
          }
        />

        {error && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: "100%" }}>
            {success}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
        >
          {loading ? t("resetting_password", "Resetting Password...") : t("reset_password", "Reset Password")}
        </Button>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
          >
            {t("back_to_login", "Back to Login")}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default PasswordRecoveryConfirm;
