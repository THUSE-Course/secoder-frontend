import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import PageHeader from '../../../components/common/PageHeader';
import AlertMessage from '../../../components/common/AlertMessage';
import {
  getGroups,
  getUsers,
  createGroup,
  inviteToGroup,
  getGroupInvitations,
  editGroupName,
  deleteGroup,
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
      id={`grouping-tabpanel-${index}`}
      aria-labelledby={`grouping-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const GroupManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // State for groups and users
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroup, setMyGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [confirmCreateDialogOpen, setConfirmCreateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Pagination states
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsTotal, setGroupsTotal] = useState(0);
  const pageSize = 10;
  const usersLookupPageSize = 200;
  const invitationsPageSize = 10;
  const [invitationsPage, setInvitationsPage] = useState(1);
  const [invitationsTotal, setInvitationsTotal] = useState(0);
  const [groupInvitations, setGroupInvitations] = useState<Invitation[]>([]);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCodeName, setNewGroupCodeName] = useState('');
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState('');
  const [inviteeStudentId, setInviteeStudentId] = useState('');
  const [editedGroupName, setEditedGroupName] = useState('');

  const loadData = useCallback(
    async (newGroupsPage?: number) => {
      setLoading(true);
      setError(null);
      try {
        const gPage = newGroupsPage ?? groupsPage;

        const [groupsData, usersData] = await Promise.all([
          getGroups(gPage, pageSize),
          getUsers(1, usersLookupPageSize),
        ]);
        setGroups(groupsData.groups || []);
        setGroupsTotal(Math.ceil((groupsData.groups?.length || 0) / pageSize));

        // Find current user's group
        if (currentUser) {
          const userInfo = usersData.users?.find(
            (u) => u.id === currentUser.id,
          );
          if (userInfo?.group) {
            const userGroup = groupsData.groups?.find(
              (g) => g.code_name === userInfo.group,
            );
            setMyGroup(userGroup || null);
          } else {
            setMyGroup(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    },
    [currentUser, groupsPage, pageSize, usersLookupPageSize],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadGroupInvitations = useCallback(
    async (page: number = invitationsPage) => {
      if (!myGroup || !currentUser || myGroup.leader.id !== currentUser.id) {
        setGroupInvitations([]);
        setInvitationsTotal(0);
        return;
      }
      setLoadingInvitations(true);
      setError(null);
      try {
        const response = await getGroupInvitations(
          myGroup.code_name,
          page,
          invitationsPageSize,
        );
        const invitations = response.invitations || [];
        setGroupInvitations(invitations);
        setInvitationsTotal(
          invitations.length === invitationsPageSize ? page + 1 : page,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load group invitations',
        );
      } finally {
        setLoadingInvitations(false);
      }
    },
    [
      currentUser,
      invitationsPage,
      invitationsPageSize,
      myGroup,
      setGroupInvitations,
    ],
  );

  useEffect(() => {
    if (myGroup && currentUser && myGroup.leader.id === currentUser.id) {
      loadGroupInvitations();
    } else {
      setGroupInvitations([]);
      setInvitationsPage(1);
      setInvitationsTotal(0);
    }
  }, [currentUser, loadGroupInvitations, myGroup]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupCodeName.trim()) {
      setError(t('group_name_required'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createGroup(newGroupName.trim(), newGroupCodeName.trim());
      setSuccess(t('group_created_success'));
      setCreateDialogOpen(false);
      setNewGroupName('');
      setNewGroupCodeName('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!selectedGroupForInvite || !inviteeStudentId.trim()) {
      setError(t('invite_fields_required'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await inviteToGroup(selectedGroupForInvite, inviteeStudentId.trim());
      setSuccess(t('invitation_sent_success'));
      setInviteDialogOpen(false);
      setSelectedGroupForInvite('');
      setInviteeStudentId('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send invitation',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async () => {
    if (!myGroup) return;
    if (!editedGroupName.trim()) {
      setError(t('group_name_required'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await editGroupName(myGroup.code_name, editedGroupName.trim());
      setSuccess(t('group_name_updated'));
      setEditDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!myGroup) return;
    setLoading(true);
    setError(null);
    try {
      await deleteGroup(myGroup.code_name);
      setSuccess(t('group_deleted_success'));
      setDeleteDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isLeader = !!myGroup && currentUser?.id === myGroup.leader.id;

  useEffect(() => {
    if (!isLeader && tabValue === 2) {
      setTabValue(0);
    }
  }, [isLeader, tabValue]);

  const handleGroupsPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setGroupsPage(value);
  };

  const handleInvitationsPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setInvitationsPage(value);
    loadGroupInvitations(value);
  };

  const closeAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ padding: 3 }}>
        <PageHeader
          title={t('group_management')}
          actions={
            <Tooltip title={t('refresh')}>
              <IconButton
                onClick={async () => {
                  await loadData();
                  if (isLeader) {
                    await loadGroupInvitations();
                  }
                }}
                disabled={loading || loadingInvitations}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />

        {error && (
          <AlertMessage
            severity="error"
            message={error}
            onClose={closeAlerts}
            sx={{ mb: 2 }}
          />
        )}

        {success && (
          <AlertMessage
            severity="success"
            message={success}
            onClose={closeAlerts}
            sx={{ mb: 2 }}
          />
        )}

        <Divider sx={{ marginBottom: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="grouping tabs"
          >
            <Tab label={t('my_group')} />
            <Tab label={t('all_groups')} />
            {isLeader && <Tab label={t('group_invitations')} />}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!myGroup && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setConfirmCreateDialogOpen(true)}
                  disabled={loading}
                >
                  {t('create_group')}
                </Button>
              </Box>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && !myGroup && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {t(
                  'no_groups_message',
                  'No groups found. Create or get invited to a group to get started.',
                )}
              </Typography>
            )}

            {!loading && myGroup && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {myGroup.name}
                    </Typography>
                    <Chip
                      label={myGroup.code_name}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        maxWidth: '100%',
                        '& .MuiChip-label': {
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        },
                      }}
                    />
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t('leader')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${myGroup.leader.name} (${myGroup.leader.id})`}
                        color={
                          currentUser?.id === myGroup.leader.id
                            ? 'success'
                            : 'default'
                        }
                        size="small"
                      />
                      {currentUser?.id === myGroup.leader.id && (
                        <Chip
                          label={t('you')}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t('members')} ({myGroup.members.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {myGroup.members.map((member) => (
                        <Chip
                          key={member.id}
                          label={member.name}
                          color={
                            currentUser?.id === member.id
                              ? 'success'
                              : 'default'
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>

                  {currentUser?.id === myGroup.leader.id && (
                    <Box sx={{ pt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={() => {
                          setSelectedGroupForInvite(myGroup.code_name);
                          setInviteDialogOpen(true);
                        }}
                        size="small"
                      >
                        {t('invite_to_group')}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => {
                          setEditedGroupName(myGroup.name);
                          setEditDialogOpen(true);
                        }}
                      >
                        {t('edit_group')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        {t('delete_group')}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>
                        <strong>{t('group_name')}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>{t('group_code_name')}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>{t('leader')}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>{t('members')}</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.code_name} hover>
                        <TableCell
                          sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {group.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {group.code_name}
                        </TableCell>
                        <TableCell
                          sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {group.leader.name}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            ({group.leader.id})
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {group.members.map((member) => (
                              <Chip
                                key={member.id}
                                label={member.name}
                                size="small"
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {groupsTotal > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Pagination
                    count={groupsTotal}
                    page={groupsPage}
                    onChange={handleGroupsPageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}
        </TabPanel>

        {isLeader && (
          <TabPanel value={tabValue} index={2}>
            {loadingInvitations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : groupInvitations.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {t('no_group_invitations')}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                          <strong>{t('invitee_id')}</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupInvitations.map((invitation) => (
                        <TableRow key={invitation.token} hover>
                          <TableCell
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {invitation.group_code_name}
                          </TableCell>
                          <TableCell>{invitation.inviter_id}</TableCell>
                          <TableCell>{invitation.invitee_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {invitationsTotal > 1 && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}
                  >
                    <Pagination
                      count={invitationsTotal}
                      page={invitationsPage}
                      onChange={handleInvitationsPageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </Box>
            )}
          </TabPanel>
        )}

        {/* Confirm Create Group Dialog */}
        <Dialog
          open={confirmCreateDialogOpen}
          onClose={() => setConfirmCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('create_group_warning')}</DialogTitle>
          <DialogContent>
            <AlertMessage
              severity="warning"
              message={t('create_group_warning_message')}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {t('create_group_confirm_message')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCreateDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                setConfirmCreateDialogOpen(false);
                setCreateDialogOpen(true);
              }}
              variant="contained"
              color="primary"
            >
              {t('continue')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Group Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('create_new_group')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('group_name')}
              fullWidth
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              helperText={t('group_name_help')}
            />
            <TextField
              margin="dense"
              label={t('group_code_name')}
              fullWidth
              value={newGroupCodeName}
              onChange={(e) => setNewGroupCodeName(e.target.value)}
              helperText={t(
                'group_code_name_help',
                'Unique identifier (must conform to GitLab group name rules)',
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreateGroup}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Invite User Dialog */}
        <Dialog
          open={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('invite_user_to_group')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('student_id')}
              fullWidth
              value={inviteeStudentId}
              onChange={(e) => setInviteeStudentId(e.target.value)}
              helperText={t(
                'invitee_student_id_help',
                'Student ID of the person to invite',
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleInviteUser}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('send_invite')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Group Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('edit_group')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('group_name')}
              fullWidth
              value={editedGroupName}
              onChange={(e) => setEditedGroupName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleEditGroup}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('save_changes')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Group Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('delete_group')}</DialogTitle>
          <DialogContent>
            <AlertMessage
              severity="warning"
              message={t('delete_group_warning')}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {t('delete_group_confirm')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDeleteGroup}
              variant="contained"
              color="error"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('delete_group')}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GroupManagement;
