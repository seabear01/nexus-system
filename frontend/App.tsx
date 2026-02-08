import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { RoleManagement } from './pages/RoleManagement';
import { Profile } from './pages/Profile';
import { BlogList } from './pages/blog/BlogList';
import { BlogEditor } from './pages/blog/BlogEditor';
import { BlogView } from './pages/blog/BlogView';
import { User, AuthState } from './types';
import { apiLogin } from './services/api';

const App: React.FC = () => {
  // Simple State-based Routing with basic params support (e.g., 'blog-edit:123')
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  
  // Auth State
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null
  });

  const [emailInput, setEmailInput] = useState('admin@nexus.com');
  const [loginError, setLoginError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('nexus_session_user');
    if (storedUser) {
      setAuth({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        token: 'mock-jwt-token'
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const user = await apiLogin(emailInput);
      setAuth({ user, isAuthenticated: true, token: 'mock-jwt-token' });
      localStorage.setItem('nexus_session_user', JSON.stringify(user));
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false, token: null });
    localStorage.removeItem('nexus_session_user');
    setCurrentRoute('dashboard');
  };

  const handleNavigate = (path: string, id?: string) => {
    if (id) {
      setCurrentRoute(`${path}:${id}`);
    } else {
      setCurrentRoute(path);
    }
  };

  // Login Screen
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-2xl text-white">N</div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Nexus User System</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your organization
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1">
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    autoComplete="email" 
                    required 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    autoComplete="current-password" 
                    required 
                    defaultValue="password" // Mock password
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {loginError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {loginError}
                </div>
              )}

              <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Sign in
                </button>
              </div>
            </form>
            
            <div className="mt-6">
               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-center space-x-4 text-xs text-blue-600">
                  <button onClick={() => setEmailInput('admin@nexus.com')}>admin@nexus.com</button>
                  <button onClick={() => setEmailInput('demo@nexus.com')}>demo@nexus.com</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Basic Router Logic
  let Content = <Dashboard />;
  
  if (currentRoute === 'users') {
    Content = <UserManagement />;
  } else if (currentRoute === 'roles') {
    Content = <RoleManagement />;
  } else if (currentRoute === 'blogs') {
    Content = <BlogList onNavigate={handleNavigate} />;
  } else if (currentRoute.startsWith('blog-edit')) {
    const editId = currentRoute.split(':')[1];
    Content = <BlogEditor id={editId} currentUser={auth.user} onNavigate={handleNavigate} />;
  } else if (currentRoute.startsWith('blog-view')) {
    const viewId = currentRoute.split(':')[1];
    Content = <BlogView id={viewId} onNavigate={handleNavigate} />;
  } else if (currentRoute === 'profile') {
    Content = auth.user ? (
      <Profile 
        user={auth.user} 
        onUpdate={(u) => {
          setAuth(prev => ({ ...prev, user: u }));
          localStorage.setItem('nexus_session_user', JSON.stringify(u));
        }} 
      />
    ) : <div>Loading...</div>;
  }

  return (
    <Layout 
      currentUser={auth.user} 
      onLogout={handleLogout} 
      currentPath={currentRoute.split(':')[0]} // Handle base path highlighting
      onNavigate={handleNavigate}
    >
      {Content}
    </Layout>
  );
};

export default App;