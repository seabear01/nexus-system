
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BANNED = 'BANNED'
}

export interface PermissionDef {
  id: string;
  key: string;         // e.g. 'user:read'
  name: string;        // e.g. 'Read Users'
  description: string;
  group: string;       // e.g. 'User Management'
  isSystem?: boolean;  // If true, cannot be deleted
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of Permission keys
  isSystem?: boolean; // Cannot be deleted if true
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roleId: string;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  bio?: string;
}

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  status: BlogStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Simulating the DB Schema response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}