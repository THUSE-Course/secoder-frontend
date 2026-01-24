// Password validation function
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
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

  const characterTypes = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;

  if (characterTypes < 3) {
    errors.push('Password must contain at least 3 different types of characters (uppercase, lowercase, numbers, symbols)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Hash password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function post(
  payload: RegisterPayload | LoginPayload | RecoverPasswordPayload | ConfirmPasswordRecoveryPayload,
  route: string
): Promise<any> {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  try {
    const response = await fetch(`${apiEndpoint}/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Check if response has content
    const contentType = response.headers.get('content-type');
    let data: any = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Response text:', text);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        data = {}; // Empty response
      }
    } else {
      // Non-JSON response
      const text = await response.text();
      console.error('Non-JSON response:', text);
      data = { msg: text || 'Unknown error' };
    }

    if (!response.ok) {
      const errorMessage = data?.msg || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

// Authenticated API call
async function authenticatedRequest(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<any> {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const authToken = token || localStorage.getItem('auth_token');

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

    // Check if response has content
    const contentType = response.headers.get('content-type');
    let data: any = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Response text:', text);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        data = {}; // Empty response
      }
    } else {
      // Non-JSON response
      const text = await response.text();
      console.error('Non-JSON response:', text);
      data = { msg: text || 'Unknown error' };
    }

    if (!response.ok) {
      const errorMessage = data?.msg || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Authenticated API request error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

interface RegisterPayload {
  student_id: string;
  rPassword: string;
  email: string;
  password: string; // SHA-256 hashed password
}

interface LoginPayload {
  student_id: string;
  password: string; // SHA-256 hashed password
}

interface RecoverPasswordPayload {
  student_id: string;
  email: string;
}

interface ConfirmPasswordRecoveryPayload {
  token: string;
  newPassword: string; // SHA-256 hashed password
}

interface LoginResponse {
  token: string;
  msg?: string;
}

interface UserInfo {
  student_id: string;
  email: string;
}

// Grouping interfaces
interface User {
  student_id: string;
  name: string;
  group: string | null;
}

interface GroupMember {
  student_id: string;
  name: string;
}

interface GroupLeader {
  student_id: string;
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

// Grouping API functions
async function getUsers(page: number = 1, pageSize: number = 20): Promise<UsersResponse> {
  return authenticatedRequest(`/users?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
  });
}

async function getGroups(page: number = 1, pageSize: number = 20): Promise<GroupsResponse> {
  return authenticatedRequest(`/groups?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
  });
}

async function createGroup(name: string, codeName: string): Promise<any> {
  return authenticatedRequest('/group/create', {
    method: 'POST',
    body: JSON.stringify({
      name,
      code_name: codeName,
    }),
  });
}

async function inviteToGroup(groupCodeName: string, inviteeStudentId: string): Promise<any> {
  return authenticatedRequest('/group/invite', {
    method: 'POST',
    body: JSON.stringify({
      group_code_name: groupCodeName,
      invitee_student_id: inviteeStudentId,
    }),
  });
}

async function acceptInvitation(token: string): Promise<any> {
  return authenticatedRequest('/group/invite/accept', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

async function rejectInvitation(token: string): Promise<any> {
  return authenticatedRequest('/group/invite/reject', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

async function joinGroup(groupCodeName: string): Promise<any> {
  return authenticatedRequest('/group/join', {
    method: 'POST',
    body: JSON.stringify({
      group_code_name: groupCodeName,
    }),
  });
}

async function acceptJoinRequest(token: string): Promise<any> {
  return authenticatedRequest('/group/join/accept', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

async function rejectJoinRequest(token: string): Promise<any> {
  return authenticatedRequest('/group/join/reject', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

async function assignUserToGroup(groupCodeName: string, studentId: string): Promise<any> {
  return authenticatedRequest('/admin/group_assign', {
    method: 'POST',
    body: JSON.stringify({
      group_code_name: groupCodeName,
      student_id: studentId,
    }),
  });
}

export type {
  RegisterPayload,
  LoginPayload,
  RecoverPasswordPayload,
  ConfirmPasswordRecoveryPayload,
  LoginResponse,
  UserInfo,
  User,
  Group,
  GroupMember,
  GroupLeader,
  UsersResponse,
  GroupsResponse,
};
export {
  post,
  authenticatedRequest,
  hashPassword,
  validatePassword,
  getUsers,
  getGroups,
  createGroup,
  inviteToGroup,
  acceptInvitation,
  rejectInvitation,
  joinGroup,
  acceptJoinRequest,
  rejectJoinRequest,
  assignUserToGroup,
};
