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
  Alert,
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
  Group as GroupIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getGroups,
  getUsers,
  createGroup,
  inviteToGroup,
  joinGroup,
} from '../../../utils';
import type { Group, User } from '../../../utils';

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
  const [users, setUsers] = useState<User[]>([]);
  const [myGroup, setMyGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [confirmCreateDialogOpen, setConfirmCreateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  // Pagination states
  const [groupsPage, setGroupsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [groupsTotal, setGroupsTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);
  const pageSize = 10;

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCodeName, setNewGroupCodeName] = useState('');
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState('');
  const [inviteeStudentId, setInviteeStudentId] = useState('');
  const [joinGroupCodeName, setJoinGroupCodeName] = useState('');
  const [joinGroupName, setJoinGroupName] = useState('');

  const loadData = useCallback(
    async (newGroupsPage?: number, newUsersPage?: number) => {
      setLoading(true);
      setError(null);
      try {
        const gPage = newGroupsPage ?? groupsPage;
        const uPage = newUsersPage ?? usersPage;

        const [groupsData, usersData] = await Promise.all([
          getGroups(gPage, pageSize),
          getUsers(uPage, pageSize),
        ]);
        setGroups(groupsData.groups || []);
        setUsers(usersData.users || []);
        setGroupsTotal(Math.ceil((groupsData.groups?.length || 0) / pageSize));
        setUsersTotal(Math.ceil((usersData.users?.length || 0) / pageSize));

        // Find current user's group
        if (currentUser) {
          const userInfo = usersData.users?.find(
            (u) => u.student_id === currentUser.student_id,
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
    [currentUser, groupsPage, pageSize, usersPage],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupCodeName.trim()) {
      setError(
        t('group_name_required', 'Group name and code name are required'),
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createGroup(newGroupName.trim(), newGroupCodeName.trim());
      setSuccess(t('group_created_success', 'Group created successfully!'));
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
      setError(t('invite_fields_required', 'Please enter a student ID'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await inviteToGroup(selectedGroupForInvite, inviteeStudentId.trim());
      setSuccess(t('invitation_sent_success', 'Invitation sent successfully!'));
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

  const handleJoinGroup = async () => {
    if (!joinGroupCodeName.trim()) {
      setError(t('group_code_required', 'Please enter a group code name'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await joinGroup(joinGroupCodeName.trim());
      setSuccess(
        t('join_request_sent_success', 'Join request sent successfully!'),
      );
      setJoinDialogOpen(false);
      setJoinGroupCodeName('');
      setJoinGroupName('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send join request',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGroupsPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setGroupsPage(value);
  };

  const handleUsersPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setUsersPage(value);
  };

  const closeAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Card sx={{ width: '100%', boxShadow: 2 }}>
      <CardContent sx={{ padding: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon color="primary" fontSize="large" />
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 'medium' }}
            >
              {t('group_management', 'Group Management')}
            </Typography>
          </Box>
          <Tooltip title={t('refresh', 'Refresh')}>
            <IconButton
              onClick={() => loadData()}
              disabled={loading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

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
            onChange={handleTabChange}
            aria-label="grouping tabs"
          >
            <Tab label={t('my_group', 'My Group')} />
            <Tab label={t('all_groups', 'All Groups')} />
            <Tab label={t('all_users', 'All Users')} />
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
                  {t('create_group', 'Create Group')}
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
                  'No groups found. Create or join a group to get started.',
                )}
              </Typography>
            )}

            {!loading && myGroup && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" component="div">
                      {myGroup.name}
                    </Typography>
                    <Chip
                      label={myGroup.code_name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t('leader', 'Leader')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${myGroup.leader.name} (${myGroup.leader.student_id})`}
                        color={
                          currentUser?.student_id === myGroup.leader.student_id
                            ? 'success'
                            : 'default'
                        }
                        size="small"
                      />
                      {currentUser?.student_id ===
                        myGroup.leader.student_id && (
                        <Chip
                          label={t('you', 'You')}
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
                      {t('members', 'Members')} ({myGroup.members.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {myGroup.members.map((member) => (
                        <Chip
                          key={member.student_id}
                          label={member.name}
                          color={
                            currentUser?.student_id === member.student_id
                              ? 'success'
                              : 'default'
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>

                  {currentUser?.student_id === myGroup.leader.student_id && (
                    <Box sx={{ pt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={() => {
                          setSelectedGroupForInvite(myGroup.code_name);
                          setInviteDialogOpen(true);
                        }}
                        size="small"
                      >
                        {t('invite_to_group', 'Invite to Group')}
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
                        <strong>{t('group_name', 'Group Name')}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>
                          {t('group_code_name', 'Group Code Name')}
                        </strong>
                      </TableCell>
                      <TableCell>
                        <strong>{t('leader', 'Leader')}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>{t('members', 'Members')}</strong>
                      </TableCell>
                      {!myGroup && (
                        <TableCell>
                          <strong>{t('actions', 'Actions')}</strong>
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.code_name} hover>
                        <TableCell>{group.name}</TableCell>
                        <TableCell>{group.code_name}</TableCell>
                        <TableCell>
                          {group.leader.name}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            ({group.leader.student_id})
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {group.members.map((member) => (
                              <Chip
                                key={member.student_id}
                                label={member.name}
                                size="small"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        {!myGroup && (
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<GroupAddIcon />}
                              onClick={() => {
                                setJoinGroupCodeName(group.code_name);
                                setJoinGroupName(group.name);
                                setJoinDialogOpen(true);
                              }}
                            >
                              {t('request_join', 'Join')}
                            </Button>
                          </TableCell>
                        )}
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

        <TabPanel value={tabValue} index={2}>
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
                        <strong>{t('name', 'Name')}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>{t('student_id', 'Student ID')}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>{t('group', 'Group')}</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.student_id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.student_id}</TableCell>
                        <TableCell>
                          {user.group ? (
                            user.group
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: 'italic' }}
                            >
                              {t('no_group', 'No group')}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {usersTotal > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Pagination
                    count={usersTotal}
                    page={usersPage}
                    onChange={handleUsersPageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}
        </TabPanel>

        {/* Confirm Create Group Dialog */}
        <Dialog
          open={confirmCreateDialogOpen}
          onClose={() => setConfirmCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t('create_group_warning', 'Important Notice')}
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t(
                'create_group_warning_message',
                'Once a group is created, you cannot delete it. You will become the group leader.',
              )}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              {t(
                'create_group_confirm_message',
                'Are you sure you want to create a new group?',
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCreateDialogOpen(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              onClick={() => {
                setConfirmCreateDialogOpen(false);
                setCreateDialogOpen(true);
              }}
              variant="contained"
              color="primary"
            >
              {t('continue', 'Continue')}
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
          <DialogTitle>{t('create_new_group', 'Create New Group')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('group_name', 'Group Name')}
              fullWidth
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              helperText={t('group_name_help', 'Display name for the group')}
            />
            <TextField
              margin="dense"
              label={t('group_code_name', 'Group Code Name')}
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
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleCreateGroup}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('create', 'Create')}
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
          <DialogTitle>
            {t('invite_user_to_group', 'Invite User to Group')}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('student_id', 'Student ID')}
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
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleInviteUser}
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                t('send_invite', 'Send Invite')
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Join Group Dialog */}
        <Dialog
          open={joinDialogOpen}
          onClose={() => {
            setJoinDialogOpen(false);
            setJoinGroupCodeName('');
            setJoinGroupName('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('join_group', 'Join Group')}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ py: 2 }}>
              {t('join_group_confirm', 'Do you want to join group')}{' '}
              <strong>{joinGroupName}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setJoinDialogOpen(false);
                setJoinGroupCodeName('');
                setJoinGroupName('');
              }}
            >
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleJoinGroup}
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                t('send_request', 'Send Request')
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GroupManagement;
