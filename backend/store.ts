// Data Models
export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  group: string;
  isSystem: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  status: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLogin?: Date;
  bio?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  status: string; // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory Storage
export const db = {
  permissions: [] as Permission[],
  roles: [] as Role[],
  users: [] as User[],
  blogs: [] as BlogPost[]
};

// Seeding Logic
export const seedDatabase = async () => {
  if (db.roles.length === 0) {
    console.log('Seeding In-Memory Database...');
    
    // Create Permissions
    const initialPerms: Permission[] = [
      { id: 'perm-1', key: 'user:read', name: 'View Users', description: 'Can view user lists', group: 'User Management', isSystem: true },
      { id: 'perm-2', key: 'user:write', name: 'Edit Users', description: 'Can modify users', group: 'User Management', isSystem: true },
      { id: 'perm-3', key: 'user:delete', name: 'Delete Users', description: 'Can remove users', group: 'User Management', isSystem: true },
      { id: 'perm-4', key: 'role:read', name: 'View Roles', description: 'Can view roles', group: 'Role Management', isSystem: true },
      { id: 'perm-5', key: 'role:write', name: 'Manage Roles', description: 'Can modify roles', group: 'Role Management', isSystem: true },
      { id: 'perm-6', key: 'system:settings', name: 'System Settings', description: 'Access settings', group: 'System', isSystem: true },
      { id: 'perm-7', key: 'blog:read', name: 'View Blogs', description: 'Can view blog posts', group: 'Blog Management', isSystem: true },
      { id: 'perm-8', key: 'blog:write', name: 'Manage Blogs', description: 'Can create and edit blog posts', group: 'Blog Management', isSystem: true },
    ];
    db.permissions = [...initialPerms];

    // Create Roles
    const adminRole: Role = {
      id: 'role-admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: initialPerms.map(p => p.key),
      isSystem: true
    };

    const managerRole: Role = {
      id: 'role-manager',
      name: 'Manager',
      description: 'Can manage users',
      permissions: ['user:read', 'user:write', 'user:delete', 'blog:read', 'blog:write'],
      isSystem: false
    };
    db.roles = [adminRole, managerRole];

    // Create Users
    db.users = [
      {
        id: 'user-admin',
        email: 'admin@nexus.com',
        name: 'System Admin',
        roleId: adminRole.id,
        status: 'ACTIVE',
        avatarUrl: 'https://picsum.photos/seed/admin/200/200',
        createdAt: new Date(),
        bio: 'Super administrator of the Nexus system.'
      },
      {
        id: 'user-demo',
        email: 'demo@nexus.com',
        name: 'Demo Manager',
        roleId: managerRole.id,
        status: 'ACTIVE',
        avatarUrl: 'https://picsum.photos/seed/demo/200/200',
        createdAt: new Date(),
        bio: 'Regional manager handling user onboarding.'
      }
    ];
    
    // Create Blogs
    db.blogs = [
      {
        id: 'blog-1',
        title: 'Welcome to Nexus',
        excerpt: 'An introduction to our new user management system.',
        content: 'Nexus provides a comprehensive dashboard for managing users, roles, and permissions. This system is built with React and Express.',
        authorId: 'user-admin',
        status: 'PUBLISHED',
        tags: ['system', 'update'],
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'blog-2',
        title: 'Q4 Roadmap',
        excerpt: 'What we are planning for the next quarter.',
        content: 'We are planning to add more AI features, better analytics, and improved role-based access control granularity.',
        authorId: 'user-demo',
        status: 'DRAFT',
        tags: ['planning', 'roadmap'],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      }
    ];

    console.log('Database Seeded!');
  }
};