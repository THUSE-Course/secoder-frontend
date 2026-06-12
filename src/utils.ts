// Password validation function
function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for different character types
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);

  const characterTypes = [
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSymbols,
  ].filter(Boolean).length;

  if (characterTypes < 3) {
    errors.push(
      'Password must contain at least 3 different types of characters (uppercase, lowercase, numbers, symbols)',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

type ApiResponse = Record<string, unknown>;

export const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
const AUTH_TOKEN_KEY = 'auth_token';

export const getStoredAuthToken = (): string | null =>
  sessionStorage.getItem(AUTH_TOKEN_KEY) ||
  localStorage.getItem(AUTH_TOKEN_KEY);

export const storeAuthToken = (token: string, remember: boolean): void => {
  if (remember) {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearStoredAuthToken = (): void => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = `${normalized}${'='.repeat(padLength)}`;
  return atob(padded);
};

const parseJwtClaims = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    return parsed;
  } catch (error) {
    console.error('Failed to parse JWT claims:', error);
    return null;
  }
};

const extractErrorMessage = (data: unknown): string | undefined => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  const msg = record.msg;
  return typeof msg === 'string' ? msg : undefined;
};

const safeJsonParse = (text: string): unknown | undefined => {
  if (!text.trim()) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  if (!response.ok) {
    const parsed = safeJsonParse(text);
    const message =
      extractErrorMessage(parsed) || (text.trim() ? text : undefined);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (!text.trim()) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const parsed = safeJsonParse(text);
    if (parsed === undefined) {
      throw new Error('Invalid JSON response from server');
    }
    return parsed as T;
  }

  return text as T;
};

async function post<T = ApiResponse>(
  payload:
    | RegisterPayload
    | LoginPayload
    | RecoverPasswordPayload
    | ConfirmPasswordRecoveryPayload,
  route: string,
): Promise<T> {
  try {
    const response = await fetch(`${apiEndpoint}/${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse<T>(response);
  } catch (error: unknown) {
    console.error('API request error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

// Authenticated API call
async function authenticatedRequest<T = ApiResponse>(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const authToken = token || getStoredAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${apiEndpoint}${url}`, {
      ...options,
      headers,
    });
    return await handleResponse<T>(response);
  } catch (error: unknown) {
    console.error('Authenticated API request error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

interface RegisterPayload {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  id: string;
  password: string;
}

interface RecoverPasswordPayload {
  id: string;
  email: string;
}

interface ConfirmPasswordRecoveryPayload {
  token: string;
  newPassword: string;
}

interface EditUserPayload {
  email?: string;
  name?: string;
  password?: string;
}

interface LoginResponse {
  token: string;
  msg?: string;
}

interface UserInfo {
  id: string;
  email: string;
}

// Grouping interfaces
interface User {
  id: string;
  name: string;
  email?: string;
  sudo?: boolean;
  group: string | null;
}

interface GroupMember {
  id: string;
  name: string;
}

interface GroupLeader {
  id: string;
  name: string;
}

interface Group {
  name: string;
  code_name: string;
  leader: GroupLeader;
  members: GroupMember[];
}

interface UsersResponse {
  page: number;
  page_size: number;
  users: User[];
}

interface GroupsResponse {
  page: number;
  page_size: number;
  groups: Group[];
}

interface Invitation {
  token: string;
  group_code_name: string;
  inviter_id: string;
  invitee_id: string;
}

interface InvitationsResponse {
  page: number;
  page_size: number;
  invitations: Invitation[];
}

interface GroupInvitationsResponse extends InvitationsResponse {
  group_code_name: string;
}

interface StatusResponse {
  readonly: boolean;
}

interface AdminUserAccess {
  id: string;
  banned: boolean;
  registered: boolean;
  name?: string | null;
  email?: string | null;
  sudo: boolean;
  group?: string | null;
}

interface AdminUsersResponse {
  page: number;
  page_size: number;
  total: number;
  users: AdminUserAccess[];
}

// Grouping API functions
async function getUsers(
  page: number = 1,
  pageSize: number = 20,
): Promise<UsersResponse> {
  return authenticatedRequest<UsersResponse>(
    `/users?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
    },
  );
}

async function getGroups(
  page: number = 1,
  pageSize: number = 20,
): Promise<GroupsResponse> {
  return authenticatedRequest<GroupsResponse>(
    `/groups?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
    },
  );
}

async function createGroup(
  name: string,
  codeName: string,
): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/group/create', {
    method: 'POST',
    body: JSON.stringify({
      name,
      code_name: codeName,
    }),
  });
}

async function inviteToGroup(
  groupCodeName: string,
  inviteeStudentId: string,
): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/group/invite', {
    method: 'POST',
    body: JSON.stringify({
      group_code_name: groupCodeName,
      invitee_id: inviteeStudentId,
    }),
  });
}

async function editGroupName(
  groupCodeName: string,
  name: string,
): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/group/edit', {
    method: 'POST',
    body: JSON.stringify({
      group_code_name: groupCodeName,
      name,
    }),
  });
}

async function deleteGroup(groupCodeName: string): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/group/delete', {
    method: 'POST',
    body: JSON.stringify({
      group_code_name: groupCodeName,
    }),
  });
}

async function acceptInvitation(token: string): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/group/invite/accept', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

async function rejectInvitation(token: string): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/group/invite/reject', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

async function getUserInvitations(
  page: number = 1,
  pageSize: number = 20,
): Promise<InvitationsResponse> {
  return authenticatedRequest<InvitationsResponse>(
    `/user/invite/list?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
    },
  );
}

async function getGroupInvitations(
  groupCodeName: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<GroupInvitationsResponse> {
  return authenticatedRequest<GroupInvitationsResponse>(
    `/group/invite/list?group_code_name=${encodeURIComponent(
      groupCodeName,
    )}&page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
    },
  );
}

async function editUserInfo(payload: EditUserPayload): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/user/edit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getRbacToken(): Promise<string> {
  return authenticatedRequest<string>('/rbac', {
    method: 'GET',
  });
}

async function rotateRbacToken(): Promise<string> {
  return authenticatedRequest<string>('/rbac/rotate', {
    method: 'POST',
  });
}

async function getStatus(): Promise<StatusResponse> {
  return authenticatedRequest<StatusResponse>('/status', {
    method: 'GET',
  });
}

async function setReadonlyMode(readonly: boolean): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/admin/readonly', {
    method: 'POST',
    body: JSON.stringify({ readonly }),
  });
}

async function impersonateUser(id: string): Promise<LoginResponse | string> {
  return authenticatedRequest<LoginResponse | string>('/admin/impersonate', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

async function getAdminUsers(
  page: number = 1,
  pageSize: number = 20,
): Promise<AdminUsersResponse> {
  return authenticatedRequest<AdminUsersResponse>(
    `/admin/users?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
    },
  );
}

async function addAdminUser(
  id: string,
  password: string,
): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/admin/users/add', {
    method: 'POST',
    body: JSON.stringify({ id, password }),
  });
}

async function banAdminUser(id: string): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/admin/users/ban', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

async function unbanAdminUser(id: string): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/admin/users/unban', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

async function syncGitlab(): Promise<ApiResponse> {
  return authenticatedRequest<ApiResponse>('/sync', {
    method: 'GET',
  });
}

export type {
  RegisterPayload,
  LoginPayload,
  RecoverPasswordPayload,
  ConfirmPasswordRecoveryPayload,
  EditUserPayload,
  LoginResponse,
  UserInfo,
  User,
  Group,
  GroupMember,
  GroupLeader,
  UsersResponse,
  GroupsResponse,
  Invitation,
  InvitationsResponse,
  GroupInvitationsResponse,
  StatusResponse,
  AdminUserAccess,
  AdminUsersResponse,
};
export {
  post,
  authenticatedRequest,
  parseJwtClaims,
  validatePassword,
  getUsers,
  getGroups,
  createGroup,
  inviteToGroup,
  editGroupName,
  deleteGroup,
  acceptInvitation,
  rejectInvitation,
  getUserInvitations,
  getGroupInvitations,
  editUserInfo,
  getRbacToken,
  rotateRbacToken,
  getStatus,
  setReadonlyMode,
  impersonateUser,
  getAdminUsers,
  addAdminUser,
  banAdminUser,
  unbanAdminUser,
  syncGitlab,
};
