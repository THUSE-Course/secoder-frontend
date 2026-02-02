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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/common/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';
import {
  acceptInvitation,
  rejectInvitation,
  getGroupInvitations,
  getGroups,
  getUserInvitations,
  getUsers,
} from '../../../utils';
import type { Group, Invitation } from '../../../utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invitations-tabpanel-${index}`}
      aria-labelledby={`invitations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const pageSize = 20;

const InvitationManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [userInvitations, setUserInvitations] = useState<Invitation[]>([]);
  const [groupInvitations, setGroupInvitations] = useState<Invitation[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);
  const [userHasMore, setUserHasMore] = useState(false);
  const [groupHasMore, setGroupHasMore] = useState(false);
  const [leaderGroup, setLeaderGroup] = useState<Group | null>(null);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);
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

  const loadGroupInvitations = useCallback(async () => {
    if (!leaderGroup) return;
    setLoadingGroup(true);
    setError(null);
    try {
      const response = await getGroupInvitations(
        leaderGroup.code_name,
        groupPage,
        pageSize,
      );
      const invitations = response.invitations || [];
      setGroupInvitations(invitations);
      setGroupHasMore(invitations.length === pageSize);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load group invitations',
      );
    } finally {
      setLoadingGroup(false);
    }
  }, [groupPage, leaderGroup]);

  const resolveLeaderGroup = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [groupsData, usersData] = await Promise.all([
        getGroups(1, 200),
        getUsers(1, 200),
      ]);
      const userInfo = usersData.users?.find(
        (user) => user.student_id === currentUser.student_id,
      );
      if (!userInfo?.group) {
        setLeaderGroup(null);
        return;
      }
      const foundGroup = groupsData.groups?.find(
        (group) => group.code_name === userInfo.group,
      );
      if (
        foundGroup &&
        foundGroup.leader.student_id === currentUser.student_id
      ) {
        setLeaderGroup(foundGroup);
      } else {
        setLeaderGroup(null);
      }
    } catch {
      setLeaderGroup(null);
    }
  }, [currentUser]);

  useEffect(() => {
    resolveLeaderGroup();
  }, [resolveLeaderGroup]);

  useEffect(() => {
    if (!leaderGroup) {
      setGroupInvitations([]);
      setGroupPage(1);
      setGroupHasMore(false);
    }
  }, [leaderGroup]);

  useEffect(() => {
    loadUserInvitations(userPage);
  }, [loadUserInvitations, userPage]);

  useEffect(() => {
    if (leaderGroup) {
      loadGroupInvitations();
    }
  }, [leaderGroup, loadGroupInvitations]);

  const handleRefresh = async () => {
    setSuccess(null);
    setError(null);
    await loadUserInvitations(userPage);
    if (leaderGroup) {
      await loadGroupInvitations();
    }
  };

  const handleDecision = useCallback(
    async (token: string, decision: 'accept' | 'reject') => {
      setProcessingToken(token);
      setError(null);
      setSuccess(null);
      try {
        if (decision === 'accept') {
          await acceptInvitation(token);
          setSuccess(t('invitation_accepted', 'Invitation accepted!'));
        } else {
          await rejectInvitation(token);
          setSuccess(t('invitation_rejected', 'Invitation rejected'));
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
                <strong>{t('group_code_name', 'Group Code Name')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('inviter_id', 'Inviter')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('actions', 'Actions')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userInvitations.map((invitation) => (
              <TableRow key={invitation.token} hover>
                <TableCell>{invitation.group_code_name}</TableCell>
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
                      {t('accept', 'Accept')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDecision(invitation.token, 'reject')}
                      disabled={processingToken === invitation.token}
                    >
                      {t('reject', 'Reject')}
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

  const groupTable = useMemo(
    () => (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell>
                <strong>{t('group_code_name', 'Group Code Name')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('inviter_id', 'Inviter')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('invitee_id', 'Invitee')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupInvitations.map((invitation) => (
              <TableRow key={invitation.token} hover>
                <TableCell>{invitation.group_code_name}</TableCell>
                <TableCell>{invitation.inviter_id}</TableCell>
                <TableCell>{invitation.invitee_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    [groupInvitations, t],
  );

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ padding: 3 }}>
        <PageHeader
          title={t('invitations', 'Invitations')}
          actions={
            <Tooltip title={t('refresh', 'Refresh')}>
              <IconButton
                onClick={handleRefresh}
                disabled={loadingUser || loadingGroup}
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_event, newValue) => setTabValue(newValue)}
            aria-label="invitation tabs"
          >
            <Tab label={t('my_invitations', 'My Invitations')} />
            <Tab label={t('group_invitations', 'Group Invitations')} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {loadingUser ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : userInvitations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {t('no_invitations', 'No invitations yet.')}
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {!leaderGroup ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {t(
                'not_group_leader',
                'Only group leaders can view group invitations.',
              )}
            </Typography>
          ) : loadingGroup ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : groupInvitations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {t('no_group_invitations', 'No group invitations yet.')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groupTable}
              {pageCount(groupPage, groupHasMore) > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Pagination
                    count={pageCount(groupPage, groupHasMore)}
                    page={groupPage}
                    onChange={(_event, value) => setGroupPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default InvitationManagement;
