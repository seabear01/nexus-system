import { User, Role, PermissionDef, PaginatedResponse } from '../types';
import * as mockDb from './mockDb';

// TOGGLE THIS TO SWITCH BETWEEN REAL BACKEND AND BROWSER MOCK
// Set to true for live preview demos where backend isn't running.
// Set to false when running the Node.js server locally.
const USE_MOCK_API = true; 

const API_URL = 'http://localhost:3001/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Helper to simulate network delay for mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Users ---

export const getUsers = async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<User>> => {
  if (USE_MOCK_API) {
    await delay(300);
    return mockDb.getUsers(page, limit, search);
  }
  return fetchJson<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
};

export const getAllUsersForStats = async (): Promise<User[]> => {
  if (USE_MOCK_API) {
    return mockDb.getAllUsers();
  }
  return fetchJson<User[]>('/users/stats');
};

export const getUserById = async (id: string): Promise<User> => {
  if (USE_MOCK_API) {
    const user = mockDb.getUserById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
  // In real backend, we would have a specific endpoint or use filtering
  return fetchJson(`/users/${id}`); // Assuming route exists or handled via list
};

export const saveUser = async (user: User): Promise<User> => {
  if (USE_MOCK_API) {
    await delay(300);
    return mockDb.saveUser(user);
  }
  
  if (user.id && !user.id.startsWith('user-')) {
      return fetchJson(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) });
  }
  return fetchJson('/users', { method: 'POST', body: JSON.stringify(user) });
};

export const updateUser = async (user: User): Promise<User> => {
    if (USE_MOCK_API) {
      return mockDb.saveUser(user);
    }
    return fetchJson(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) });
};

export const createUser = async (user: Partial<User>): Promise<User> => {
    if (USE_MOCK_API) {
      // Mock logic to handle partials (add defaults)
      const newUser = {
        ...user,
        // Mock DB will generate ID and createdAt if missing, but we pass through
      } as User;
      return mockDb.saveUser(newUser);
    }
    return fetchJson('/users', { method: 'POST', body: JSON.stringify(user) });
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (USE_MOCK_API) {
    return mockDb.deleteUser(userId);
  }
  await fetchJson(`/users/${userId}`, { method: 'DELETE' });
};

export const apiLogin = async (email: string): Promise<User> => {
  if (USE_MOCK_API) {
    await delay(500);
    return mockDb.mockLogin(email);
  }
  return fetchJson('/login', { method: 'POST', body: JSON.stringify({ email }) });
};

// --- Roles ---

export const getRoles = async (): Promise<Role[]> => {
  if (USE_MOCK_API) return mockDb.getRoles();
  return fetchJson('/roles');
};

export const saveRole = async (role: Role): Promise<Role> => {
    if (USE_MOCK_API) return mockDb.saveRole(role);

    if (role.id && !role.id.startsWith('role-')) {
        return fetchJson(`/roles/${role.id}`, { method: 'PUT', body: JSON.stringify(role) });
    }
    return fetchJson('/roles', { method: 'POST', body: JSON.stringify(role) });
};

export const createRole = async (role: Partial<Role>): Promise<Role> => {
  if (USE_MOCK_API) return mockDb.saveRole(role as Role);
  return fetchJson('/roles', { method: 'POST', body: JSON.stringify(role) });
};

export const updateRole = async (role: Role): Promise<Role> => {
    if (USE_MOCK_API) return mockDb.saveRole(role);
    return fetchJson(`/roles/${role.id}`, { method: 'PUT', body: JSON.stringify(role) });
};

export const deleteRole = async (roleId: string): Promise<void> => {
  if (USE_MOCK_API) return mockDb.deleteRole(roleId);
  await fetchJson(`/roles/${roleId}`, { method: 'DELETE' });
};

// --- Permissions ---

export const getPermissions = async (): Promise<PermissionDef[]> => {
  if (USE_MOCK_API) return mockDb.getPermissions();
  return fetchJson('/permissions');
};

export const savePermission = async (perm: PermissionDef): Promise<PermissionDef> => {
     if (USE_MOCK_API) return mockDb.savePermission(perm);

     if (perm.id && !perm.id.startsWith('perm-')) {
        return fetchJson(`/permissions/${perm.id}`, { method: 'PUT', body: JSON.stringify(perm) });
    }
    return fetchJson('/permissions', { method: 'POST', body: JSON.stringify(perm) });
};

export const createPermission = async (perm: Partial<PermissionDef>): Promise<PermissionDef> => {
    if (USE_MOCK_API) return mockDb.savePermission(perm as PermissionDef);
    return fetchJson('/permissions', { method: 'POST', body: JSON.stringify(perm) });
  };
  
export const updatePermission = async (perm: PermissionDef): Promise<PermissionDef> => {
      if (USE_MOCK_API) return mockDb.savePermission(perm);
      return fetchJson(`/permissions/${perm.id}`, { method: 'PUT', body: JSON.stringify(perm) });
};

export const deletePermission = async (id: string): Promise<void> => {
  if (USE_MOCK_API) return mockDb.deletePermission(id);
  await fetchJson(`/permissions/${id}`, { method: 'DELETE' });
};