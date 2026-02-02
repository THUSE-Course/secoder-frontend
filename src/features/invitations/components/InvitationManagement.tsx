import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/common/PageHeader';
import {
  acceptInvitation,
  rejectInvitation,
  getUserInvitations,
} from '../../../utils';
import type { Invitation } from '../../../utils';

const pageSize = 20;

const InvitationManagement: React.FC = () => {
  const { t } = useTranslation();

  const [userInvitations, setUserInvitations] = useState<Invitation[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userHasMore, setUserHasMore] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [processingToken, setProcessingToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pageCount = useCallback(
    (page: number, hasMore: boolean) => (hasMore ? page + 1 : page),
    [],
  );

  const loadUserInvitations = useCallback(async (page: number) => {
    setLoadingUser(true);
    setError(null);
    try {
      const response = await getUserInvitations(page, pageSize);
      const invitations = response.invitations || [];
      setUserInvitations(invitations);
      setUserHasMore(invitations.length === pageSize);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load invitations',
      );
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    loadUserInvitations(userPage);
  }, [loadUserInvitations, userPage]);

  const handleRefresh = async () => {
    setSuccess(null);
    setError(null);
    await loadUserInvitations(userPage);
  };

  const handleDecision = useCallback(
    async (token: string, decision: 'accept' | 'reject') => {
      setProcessingToken(token);
      setError(null);
      setSuccess(null);
      try {
        if (decision === 'accept') {
          await acceptInvitation(token);
          setSuccess(t('invitation_accepted'));
        } else {
          await rejectInvitation(token);
          setSuccess(t('invitation_rejected'));
        }
        await loadUserInvitations(userPage);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update invitation',
        );
      } finally {
        setProcessingToken(null);
      }
    },
    [loadUserInvitations, t, userPage],
  );

  const closeAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  const userTable = useMemo(
    () => (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell>
                <strong>{t('group_code_name')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('inviter_id')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('actions')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userInvitations.map((invitation) => (
              <TableRow key={invitation.token} hover>
                <TableCell
                  sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                >
                  {invitation.group_code_name}
                </TableCell>
                <TableCell>{invitation.inviter_id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleDecision(invitation.token, 'accept')}
                      disabled={processingToken === invitation.token}
                    >
                      {t('accept')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDecision(invitation.token, 'reject')}
                      disabled={processingToken === invitation.token}
                    >
                      {t('reject')}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    [handleDecision, processingToken, t, userInvitations],
  );

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ padding: 3 }}>
        <PageHeader
          title={t('invitations')}
          actions={
            <Tooltip title={t('refresh')}>
              <IconButton
                onClick={handleRefresh}
                disabled={loadingUser}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />

        {error && (
          <Alert severity="error" onClose={closeAlerts} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={closeAlerts} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Divider sx={{ marginBottom: 2 }} />

        {loadingUser ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : userInvitations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {t('no_invitations')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {userTable}
            {pageCount(userPage, userHasMore) > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Pagination
                  count={pageCount(userPage, userHasMore)}
                  page={userPage}
                  onChange={(_event, value) => setUserPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationManagement;
