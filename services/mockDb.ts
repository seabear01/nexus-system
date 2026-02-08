import { User, Role, UserStatus, PermissionDef, PaginatedResponse, BlogPost, BlogStatus } from '../types';

// Constants for LocalStorage keys
const USERS_KEY = 'nexus_users';
const ROLES_KEY = 'nexus_roles';
const PERMISSIONS_KEY = 'nexus_permissions';
const BLOGS_KEY = 'nexus_blogs';

// Initial Seed Data
const INITIAL_PERMISSIONS: PermissionDef[] = [
  { id: 'perm-1', key: 'user:read', name: 'View Users', description: 'Can view user lists and details', group: 'User Management', isSystem: true },
  { id: 'perm-2', key: 'user:write', name: 'Edit Users', description: 'Can create and modify users', group: 'User Management', isSystem: true },
  { id: 'perm-3', key: 'user:delete', name: 'Delete Users', description: 'Can remove users', group: 'User Management', isSystem: true },
  { id: 'perm-4', key: 'role:read', name: 'View Roles', description: 'Can view roles and permissions', group: 'Role Management', isSystem: true },
  { id: 'perm-5', key: 'role:write', name: 'Manage Roles', description: 'Can create and modify roles', group: 'Role Management', isSystem: true },
  { id: 'perm-6', key: 'system:settings', name: 'System Settings', description: 'Access global system configuration', group: 'System', isSystem: true },
  { id: 'perm-7', key: 'blog:read', name: 'View Blogs', description: 'Can view blog posts', group: 'Blog Management', isSystem: true },
  { id: 'perm-8', key: 'blog:write', name: 'Manage Blogs', description: 'Can create and edit blog posts', group: 'Blog Management', isSystem: true },
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: INITIAL_PERMISSIONS.map(p => p.key),
    isSystem: true
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Can manage users but not roles',
    permissions: ['user:read', 'user:write', 'user:delete', 'blog:read', 'blog:write'],
    isSystem: false
  },
  {
    id: 'role-user',
    name: 'User',
    description: 'Standard access',
    permissions: ['user:read', 'blog:read'],
    isSystem: true
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@nexus.com',
    name: 'System Admin',
    roleId: 'role-admin',
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'user-demo',
    email: 'demo@nexus.com',
    name: 'Demo Manager',
    roleId: 'role-manager',
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://picsum.photos/200/200?random=2'
  }
];

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Welcome to Nexus',
    excerpt: 'An introduction to our new user management system.',
    content: 'Nexus provides a comprehensive dashboard for managing users, roles, and permissions...',
    authorId: 'user-admin',
    status: BlogStatus.PUBLISHED,
    tags: ['system', 'update'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'blog-2',
    title: 'Q4 Roadmap',
    excerpt: 'What we are planning for the next quarter.',
    content: 'We are planning to add more AI features and better analytics...',
    authorId: 'user-demo',
    status: BlogStatus.DRAFT,
    tags: ['planning'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Helper to initialize DB
const initDb = () => {
  if (!localStorage.getItem(PERMISSIONS_KEY)) {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(INITIAL_PERMISSIONS));
  }
  if (!localStorage.getItem(ROLES_KEY)) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(INITIAL_ROLES));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(BLOGS_KEY)) {
    localStorage.setItem(BLOGS_KEY, JSON.stringify(INITIAL_BLOGS));
  }
};

// Initialize on load
initDb();

// --- Permissions Service ---

export const getPermissions = (): PermissionDef[] => {
  const str = localStorage.getItem(PERMISSIONS_KEY);
  return str ? JSON.parse(str) : [];
};

export const savePermission = (perm: PermissionDef): PermissionDef => {
  const perms = getPermissions();
  if (!perm.id) perm.id = `perm-${Date.now()}`;
  
  const index = perms.findIndex(p => p.id === perm.id);
  if (index >= 0) {
    perms[index] = perm;
  } else {
    if (perms.some(p => p.key === perm.key && p.id !== perm.id)) {
      throw new Error(`Permission key "${perm.key}" already exists.`);
    }
    perms.push(perm);
  }
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms));
  return perm;
};

export const deletePermission = (id: string): void => {
  let perms = getPermissions();
  const perm = perms.find(p => p.id === id);
  if (!perm) return;
  if (perm.isSystem) throw new Error("Cannot delete system permission");
  
  perms = perms.filter(p => p.id !== id);
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms));
  
  let roles = getRoles();
  roles = roles.map(r => ({
    ...r,
    permissions: r.permissions.filter(k => k !== perm.key)
  }));
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
};

// --- Roles Service ---

export const getRoles = (): Role[] => {
  const rolesStr = localStorage.getItem(ROLES_KEY);
  return rolesStr ? JSON.parse(rolesStr) : [];
};

export const saveRole = (role: Role): Role => {
  const roles = getRoles();
  if (!role.id) role.id = `role-${Date.now()}`;

  const index = roles.findIndex(r => r.id === role.id);
  if (index >= 0) {
    roles[index] = role;
  } else {
    roles.push(role);
  }
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  return role;
};

export const deleteRole = (roleId: string): void => {
  let roles = getRoles();
  const role = roles.find(r => r.id === roleId);
  if (role?.isSystem) throw new Error("Cannot delete system role");
  roles = roles.filter(r => r.id !== roleId);
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
};

// --- Users Service ---

export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const getUsers = (page = 1, limit = 10, search = ''): PaginatedResponse<User> => {
  let users = getAllUsers();

  if (search) {
    const lowerSearch = search.toLowerCase();
    users = users.filter(u => 
      u.name.toLowerCase().includes(lowerSearch) || 
      u.email.toLowerCase().includes(lowerSearch)
    );
  }

  const total = users.length;
  const start = (page - 1) * limit;
  const slicedUsers = users.slice(start, start + limit);

  return {
    data: slicedUsers,
    total,
    page,
    limit
  };
};

export const getUserById = (id: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.id === id);
};

export const saveUser = (user: User): User => {
  let users = getAllUsers();
  
  if (!user.id) {
    user.id = `user-${Date.now()}`;
  }
  if (!user.createdAt) {
    user.createdAt = new Date().toISOString();
  }
  
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
};

export const deleteUser = (userId: string): void => {
  let users = getAllUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const mockLogin = (email: string): User => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found');
  }
  if (user.status !== UserStatus.ACTIVE) {
    throw new Error('User is not active');
  }
  
  const updatedUser = { ...user, lastLogin: new Date().toISOString() };
  saveUser(updatedUser);
  return updatedUser;
};

// --- Blogs Service ---

export const getAllBlogs = (): BlogPost[] => {
  const str = localStorage.getItem(BLOGS_KEY);
  return str ? JSON.parse(str) : [];
};

export const getBlogs = (page = 1, limit = 10, search = ''): PaginatedResponse<BlogPost> => {
  let blogs = getAllBlogs();
  
  if (search) {
    const s = search.toLowerCase();
    blogs = blogs.filter(b => b.title.toLowerCase().includes(s) || b.content.toLowerCase().includes(s));
  }

  // Sort by updated descending
  blogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const total = blogs.length;
  const start = (page - 1) * limit;
  const sliced = blogs.slice(start, start + limit);

  return { data: sliced, total, page, limit };
};

export const getBlogById = (id: string): BlogPost | undefined => {
  const blogs = getAllBlogs();
  return blogs.find(b => b.id === id);
};

export const saveBlog = (blog: BlogPost): BlogPost => {
  let blogs = getAllBlogs();
  
  if (!blog.id) {
    blog.id = `blog-${Date.now()}`;
    blog.createdAt = new Date().toISOString();
  }
  blog.updatedAt = new Date().toISOString();
  
  const index = blogs.findIndex(b => b.id === blog.id);
  if (index >= 0) {
    blogs[index] = blog;
  } else {
    blogs.push(blog);
  }
  
  localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
  return blog;
};

export const deleteBlog = (id: string): void => {
  let blogs = getAllBlogs();
  blogs = blogs.filter(b => b.id !== id);
  localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
};
