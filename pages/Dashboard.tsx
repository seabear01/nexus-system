import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { User, UserStatus, Role } from '../types';
import { getAllUsersForStats, getRoles } from '../services/api';

export const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, roleData] = await Promise.all([
          getAllUsersForStats(),
          getRoles()
        ]);
        setUsers(userData);
        setRoles(roleData);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Users',
      value: users.filter(u => u.status === UserStatus.ACTIVE).length,
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      label: 'Pending/Inactive',
      value: users.filter(u => u.status !== UserStatus.ACTIVE).length,
      icon: UserX,
      color: 'bg-amber-500',
    },
    {
      label: 'Defined Roles',
      value: roles.length,
      icon: Shield,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Registrations</h2>
          <div className="space-y-4">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center space-x-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src={user.avatarUrl || ''} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="ml-auto text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h2>
          <div className="space-y-4">
             {roles.map(role => {
               const count = users.filter(u => u.roleId === role.id).length;
               const percentage = users.length ? Math.round((count / users.length) * 100) : 0;
               return (
                 <div key={role.id}>
                   <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium text-gray-700">{role.name}</span>
                     <span className="text-gray-500">{count} users ({percentage}%)</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                     <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                     />
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};