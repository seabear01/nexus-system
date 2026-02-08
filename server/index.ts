import express, { Request, Response } from 'express';
import cors from 'cors';

// Define local interfaces to replace Prisma types and avoid dependency issues
interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  group: string;
  isSystem: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  status: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLogin?: Date;
}

interface BlogPost {
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

const app = express();
const PORT = 3001;

app.use(cors());
// Fix for "No overload matches this call" by casting the middleware
app.use(express.json({ limit: '50mb' }) as any);

// In-memory storage to replace Prisma
let permissions: Permission[] = [];
let roles: Role[] = [];
let users: User[] = [];
let blogs: BlogPost[] = []; // BLOG MODULE STORAGE

// --- SEED DATA HELPER ---
const seedIfEmpty = async () => {
  if (roles.length === 0) {
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
    permissions = [...initialPerms];

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
    roles = [adminRole, managerRole];

    // Create Users
    users = [
      {
        id: 'user-admin',
        email: 'admin@nexus.com',
        name: 'System Admin',
        roleId: adminRole.id,
        status: 'ACTIVE',
        avatarUrl: 'https://picsum.photos/200/200?random=1',
        createdAt: new Date()
      },
      {
        id: 'user-demo',
        email: 'demo@nexus.com',
        name: 'Demo Manager',
        roleId: managerRole.id,
        status: 'ACTIVE',
        avatarUrl: 'https://picsum.photos/200/200?random=2',
        createdAt: new Date()
      }
    ];
    
    // Create Blogs
    blogs = [
      {
        id: 'blog-1',
        title: 'Welcome to Nexus',
        excerpt: 'An introduction to our new user management system.',
        content: 'Nexus provides a comprehensive dashboard for managing users, roles, and permissions...',
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
        content: 'We are planning to add more AI features and better analytics...',
        authorId: 'user-demo',
        status: 'DRAFT',
        tags: ['planning'],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      }
    ];

    console.log('Database Seeded!');
  }
};

// --- CORE ROUTES ---

// Login
app.post('/api/login', (req: any, res: any) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (user.status !== 'ACTIVE') {
    res.status(403).json({ error: 'User inactive' });
    return;
  }

  user.lastLogin = new Date();
  res.json(user);
});

// Users
app.get('/api/users', (req: any, res: any) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  let filtered = users;
  if (search) {
    const s = String(search).toLowerCase();
    filtered = users.filter(u => 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s)
    );
  }

  // Sort by createdAt desc
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filtered.length;
  const start = (Number(page) - 1) * Number(limit);
  const data = filtered.slice(start, start + Number(limit));

  res.json({ data, total, page: Number(page), limit: Number(limit) });
});

app.get('/api/users/stats', (req: any, res: any) => {
  res.json(users);
});

app.post('/api/users', (req: any, res: any) => {
  const newUser: User = {
    id: `user-${Date.now()}`,
    createdAt: new Date(),
    ...req.body
  };
  users.push(newUser);
  res.json(newUser);
});

app.put('/api/users/:id', (req: any, res: any) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { id, createdAt, role, ...updates } = req.body;
  users[index] = { ...users[index], ...updates };
  res.json(users[index]);
});

app.delete('/api/users/:id', (req: any, res: any) => {
  users = users.filter(u => u.id !== req.params.id);
  res.json({ success: true });
});

// Roles
app.get('/api/roles', (req: any, res: any) => {
  res.json(roles);
});

app.post('/api/roles', (req: any, res: any) => {
  const newRole: Role = {
    id: `role-${Date.now()}`,
    ...req.body
  };
  roles.push(newRole);
  res.json(newRole);
});

app.put('/api/roles/:id', (req: any, res: any) => {
  const index = roles.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }
  
  const { id, users: _users, ...updates } = req.body;
  roles[index] = { ...roles[index], ...updates };
  res.json(roles[index]);
});

app.delete('/api/roles/:id', (req: any, res: any) => {
  const role = roles.find(r => r.id === req.params.id);
  // Simple check if role is used by any user
  const isUsed = users.some(u => u.roleId === req.params.id);

  if (role?.isSystem || isUsed) {
    res.status(400).json({ error: 'Cannot delete system role or role in use' });
    return;
  }
  
  roles = roles.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

// Permissions
app.get('/api/permissions', (req: any, res: any) => {
  res.json(permissions);
});

app.post('/api/permissions', (req: any, res: any) => {
  const newPerm: Permission = {
    id: `perm-${Date.now()}`,
    ...req.body
  };
  permissions.push(newPerm);
  res.json(newPerm);
});

app.put('/api/permissions/:id', (req: any, res: any) => {
  const index = permissions.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Permission not found' });
    return;
  }

  const { id, ...updates } = req.body;
  permissions[index] = { ...permissions[index], ...updates };
  res.json(permissions[index]);
});

app.delete('/api/permissions/:id', (req: any, res: any) => {
  permissions = permissions.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});


// --------------------------------------------------------------------------
// MODULE: BLOG
// Designed to be extracted to server/modules/blog/routes.ts in microservice
// --------------------------------------------------------------------------

app.get('/api/blogs', (req: any, res: any) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  let filtered = blogs;
  if (search) {
    const s = String(search).toLowerCase();
    filtered = blogs.filter(b => 
      b.title.toLowerCase().includes(s) || 
      b.content.toLowerCase().includes(s)
    );
  }
  
  // Sort by updatedAt desc
  filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const total = filtered.length;
  const start = (Number(page) - 1) * Number(limit);
  const data = filtered.slice(start, start + Number(limit));

  res.json({ data, total, page: Number(page), limit: Number(limit) });
});

app.get('/api/blogs/:id', (req: any, res: any) => {
  const blog = blogs.find(b => b.id === req.params.id);
  if (!blog) {
    res.status(404).json({ error: 'Blog not found' });
    return;
  }
  res.json(blog);
});

app.post('/api/blogs', (req: any, res: any) => {
  const newBlog: BlogPost = {
    id: `blog-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...req.body
  };
  blogs.push(newBlog);
  res.json(newBlog);
});

app.put('/api/blogs/:id', (req: any, res: any) => {
  const index = blogs.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Blog not found' });
    return;
  }
  
  const { id, createdAt, ...updates } = req.body;
  blogs[index] = { 
    ...blogs[index], 
    ...updates, 
    updatedAt: new Date() 
  };
  res.json(blogs[index]);
});

app.delete('/api/blogs/:id', (req: any, res: any) => {
  blogs = blogs.filter(b => b.id !== req.params.id);
  res.json({ success: true });
});

// --------------------------------------------------------------------------

// Start
seedIfEmpty().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
