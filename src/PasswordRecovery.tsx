import React, { useState } from "react";
import { Box, TextField, Button, Typography, Link, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { post, type RecoverPasswordPayload } from "./utils";
import ThemeToggle from "./components/ThemeToggle";
import LanguageSelector from "./components/LanguageSelector";

interface PasswordRecoveryProps {
  onSwitchToLogin: () => void;
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: RecoverPasswordPayload = {
        student_id: studentId,
        email: email
      };

      await post(payload, "recover_password");
      setSuccess(t("password_recovery_email_sent", "Password recovery email has been sent. Please check your email and follow the instructions."));

      // Clear form
      setStudentId("");
      setEmail("");

    } catch (err: unknown) {
      const fallbackMessage = t("password_recovery_failed", "Password recovery request failed");
      const message = err instanceof Error && err.message ? err.message : fallbackMessage;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Password recovery form */}
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
          {t("forgot_password", "Forgot Password")}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 2 }}>
          {t("password_recovery_instructions", "Enter your student ID and email address to receive password reset instructions.")}
        </Typography>

        <TextField
          label={t("studentId")}
          variant="outlined"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          fullWidth
          helperText={t("student_id_help", "Your student ID number")}
        />

        <TextField
          label={t("email")}
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          helperText={t("email_help", "Your primary email address")}
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
          disabled={loading}
        >
          {loading ? t("sending_recovery_email", "Sending...") : t("send_recovery_email", "Send Recovery Email")}
        </Button>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          {t("remember_password", "Remember your password?")}{" "}
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

export default PasswordRecovery;
