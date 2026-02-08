import express from 'express';
import cors from 'cors';
import { db, seedDatabase, User, Role, Permission, BlogPost } from './store';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }) as any);

// --- ROUTES ---

// Auth
app.post('/api/login', (req: any, res: any) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email === email);
  
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
  
  let filtered = db.users;
  if (search) {
    const s = String(search).toLowerCase();
    filtered = db.users.filter(u => 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s)
    );
  }

  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filtered.length;
  const start = (Number(page) - 1) * Number(limit);
  const data = filtered.slice(start, start + Number(limit));

  res.json({ data, total, page: Number(page), limit: Number(limit) });
});

app.get('/api/users/stats', (req: any, res: any) => {
  res.json(db.users);
});

app.get('/api/users/:id', (req: any, res: any) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

app.post('/api/users', (req: any, res: any) => {
  const newUser: User = {
    id: `user-${Date.now()}`,
    createdAt: new Date(),
    ...req.body
  };
  db.users.push(newUser);
  res.json(newUser);
});

app.put('/api/users/:id', (req: any, res: any) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { id, createdAt, role, ...updates } = req.body;
  db.users[index] = { ...db.users[index], ...updates };
  res.json(db.users[index]);
});

app.delete('/api/users/:id', (req: any, res: any) => {
  db.users = db.users.filter(u => u.id !== req.params.id);
  res.json({ success: true });
});

// Roles
app.get('/api/roles', (req: any, res: any) => {
  res.json(db.roles);
});

app.post('/api/roles', (req: any, res: any) => {
  const newRole: Role = {
    id: `role-${Date.now()}`,
    ...req.body
  };
  db.roles.push(newRole);
  res.json(newRole);
});

app.put('/api/roles/:id', (req: any, res: any) => {
  const index = db.roles.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }
  
  const { id, users: _users, ...updates } = req.body;
  db.roles[index] = { ...db.roles[index], ...updates };
  res.json(db.roles[index]);
});

app.delete('/api/roles/:id', (req: any, res: any) => {
  const role = db.roles.find(r => r.id === req.params.id);
  const isUsed = db.users.some(u => u.roleId === req.params.id);

  if (role?.isSystem || isUsed) {
    res.status(400).json({ error: 'Cannot delete system role or role in use' });
    return;
  }
  
  db.roles = db.roles.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

// Permissions
app.get('/api/permissions', (req: any, res: any) => {
  res.json(db.permissions);
});

app.post('/api/permissions', (req: any, res: any) => {
  const newPerm: Permission = {
    id: `perm-${Date.now()}`,
    ...req.body
  };
  db.permissions.push(newPerm);
  res.json(newPerm);
});

app.put('/api/permissions/:id', (req: any, res: any) => {
  const index = db.permissions.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Permission not found' });
    return;
  }

  const { id, ...updates } = req.body;
  db.permissions[index] = { ...db.permissions[index], ...updates };
  res.json(db.permissions[index]);
});

app.delete('/api/permissions/:id', (req: any, res: any) => {
  db.permissions = db.permissions.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

// Blogs
app.get('/api/blogs', (req: any, res: any) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  let filtered = db.blogs;
  if (search) {
    const s = String(search).toLowerCase();
    filtered = db.blogs.filter(b => 
      b.title.toLowerCase().includes(s) || 
      b.content.toLowerCase().includes(s)
    );
  }
  
  filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const total = filtered.length;
  const start = (Number(page) - 1) * Number(limit);
  const data = filtered.slice(start, start + Number(limit));

  res.json({ data, total, page: Number(page), limit: Number(limit) });
});

app.get('/api/blogs/:id', (req: any, res: any) => {
  const blog = db.blogs.find(b => b.id === req.params.id);
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
  db.blogs.push(newBlog);
  res.json(newBlog);
});

app.put('/api/blogs/:id', (req: any, res: any) => {
  const index = db.blogs.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Blog not found' });
    return;
  }
  
  const { id, createdAt, ...updates } = req.body;
  db.blogs[index] = { 
    ...db.blogs[index], 
    ...updates, 
    updatedAt: new Date() 
  };
  res.json(db.blogs[index]);
});

app.delete('/api/blogs/:id', (req: any, res: any) => {
  db.blogs = db.blogs.filter(b => b.id !== req.params.id);
  res.json({ success: true });
});

// Initialization
seedDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});