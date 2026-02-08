import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Plus, X, Lock, Key, Edit2, Trash2, List } from 'lucide-react';
import { Role, PermissionDef } from '../types';
import { getRoles, createRole, updateRole, deleteRole, getPermissions, createPermission, updatePermission, deletePermission } from '../services/api';
import { Button } from '../components/Button';

export const RoleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  
  // Data State
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionDef[]>([]);
  
  // Editing State
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<PermissionDef | null>(null);

  // Form Initial States
  const emptyRole: Role = {
    id: '',
    name: '',
    description: '',
    permissions: [],
    isSystem: false
  };

  const emptyPermission: PermissionDef = {
    id: '',
    key: '',
    name: '',
    description: '',
    group: 'General',
    isSystem: false
  };

  const [roleForm, setRoleForm] = useState<Role>(emptyRole);
  const [permForm, setPermForm] = useState<PermissionDef>(emptyPermission);

  const refreshData = async () => {
    try {
      const [r, p] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(r);
      setPermissions(p);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Role Handlers ---

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (roleForm.id) {
            await updateRole(roleForm);
        } else {
            await createRole(roleForm);
        }
        await refreshData();
        setEditingRole(null);
        setRoleForm(emptyRole);
    } catch(e) {
        alert("Failed to save role");
    }
  };

  const startEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ ...role });
  };

  const startCreateRole = () => {
    setEditingRole(emptyRole);
    setRoleForm(emptyRole);
  };

  const toggleRolePermission = (permKey: string) => {
    const currentPerms = new Set(roleForm.permissions);
    if (currentPerms.has(permKey)) {
      currentPerms.delete(permKey);
    } else {
      currentPerms.add(permKey);
    }
    setRoleForm({ ...roleForm, permissions: Array.from(currentPerms) });
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm("Delete this role? Users assigned to this role may lose access.")) {
      try {
        await deleteRole(id);
        await refreshData();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  // --- Permission Handlers ---

  const handleSavePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (permForm.id) {
        await updatePermission(permForm);
      } else {
        await createPermission(permForm);
      }
      await refreshData();
      setEditingPermission(null);
      setPermForm(emptyPermission);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const startEditPermission = (perm: PermissionDef) => {
    setEditingPermission(perm);
    setPermForm({ ...perm });
  };

  const startCreatePermission = () => {
    setEditingPermission(emptyPermission);
    setPermForm(emptyPermission);
  };

  const handleDeletePermission = async (id: string) => {
    if (confirm("Delete this permission? It will be removed from all roles.")) {
      try {
        await deletePermission(id);
        await refreshData();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  // Group permissions for Role Edit Modal
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionDef[]> = {};
    permissions.forEach(p => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, [permissions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
           <p className="text-sm text-gray-500 mt-1">Manage user roles and system permissions</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button 
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'roles' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Roles
          </button>
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'permissions' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Permissions
          </button>
        </div>
      </div>

      {activeTab === 'roles' ? (
        <>
          <div className="flex justify-end">
             <Button onClick={startCreateRole}>
              <Plus size={20} className="mr-2" /> Create Role
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Shield size={24} />
                  </div>
                  {role.isSystem && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center">
                      <Lock size={12} className="mr-1" /> System
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4 flex-1">{role.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Includes {role.permissions.length} Permissions</div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map(key => {
                      const p = permissions.find(pm => pm.key === key);
                      return (
                        <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200" title={p?.description || key}>
                          {p?.name || key}
                        </span>
                      );
                    })}
                    {role.permissions.length > 5 && (
                      <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => startEditRole(role)}>
                    Configure
                  </Button>
                  {!role.isSystem && (
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteRole(role.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-end">
             <Button onClick={startCreatePermission}>
              <Plus size={20} className="mr-2" /> Add Permission
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Permission Name</th>
                    <th className="px-6 py-4">Key</th>
                    <th className="px-6 py-4">Group</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   {permissions.sort((a,b) => a.group.localeCompare(b.group)).map(perm => (
                     <tr key={perm.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                         {perm.isSystem && <Lock size={12} className="mr-2 text-gray-400" />}
                         {perm.name}
                       </td>
                       <td className="px-6 py-4 font-mono text-xs text-blue-600 bg-blue-50 w-fit rounded px-2">
                         {perm.key}
                       </td>
                       <td className="px-6 py-4">
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                           {perm.group}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-gray-500">{perm.description}</td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end space-x-2">
                            <button onClick={() => startEditPermission(perm)} className="p-1 text-gray-400 hover:text-blue-600">
                              <Edit2 size={16} />
                            </button>
                            {!perm.isSystem && (
                              <button onClick={() => handleDeletePermission(perm.id)} className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            )}
                         </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {roleForm.id ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button onClick={() => setEditingRole(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveRole} className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input 
                    type="text" required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={roleForm.name}
                    onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input 
                    type="text" required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={roleForm.description}
                    onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Key size={16} className="mr-2" />
                  Permissions Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groupedPermissions).map(([group, perms]) => (
                    <div key={group} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">{group}</h5>
                      <div className="space-y-2">
                        {perms.map((perm) => (
                          <label key={perm.id} className="flex items-start space-x-3 cursor-pointer group">
                            <div className={`
                              w-5 h-5 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                              ${roleForm.permissions.includes(perm.key) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}
                            `}>
                              {roleForm.permissions.includes(perm.key) && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={roleForm.permissions.includes(perm.key)}
                              onChange={() => toggleRolePermission(perm.key)}
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block">{perm.name}</span>
                              <span className="text-xs text-gray-500">{perm.description}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <Button type="button" variant="secondary" onClick={() => setEditingRole(null)}>Cancel</Button>
                <Button type="submit">Save Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {editingPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {permForm.id ? 'Edit Permission' : 'Create Permission'}
              </h3>
              <button onClick={() => setEditingPermission(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSavePermission} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permission Name</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. View Users"
                  value={permForm.name}
                  onChange={e => setPermForm({...permForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key (Unique)</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  placeholder="e.g. user:read"
                  value={permForm.key}
                  onChange={e => setPermForm({...permForm, key: e.target.value})}
                  disabled={!!permForm.id} // Cannot change key after creation to avoid breaking refs
                />
                {permForm.id && <p className="text-xs text-gray-500 mt-1">Key cannot be changed after creation.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. User Management"
                  value={permForm.group}
                  onChange={e => setPermForm({...permForm, group: e.target.value})}
                  list="group-suggestions"
                />
                <datalist id="group-suggestions">
                   {Array.from(new Set(permissions.map(p => p.group))).map(g => (
                     <option key={g} value={g} />
                   ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={3}
                  value={permForm.description}
                  onChange={e => setPermForm({...permForm, description: e.target.value})}
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={() => setEditingPermission(null)}>Cancel</Button>
                <Button type="submit">Save Permission</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};