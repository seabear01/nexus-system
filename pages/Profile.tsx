import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mail, Key, Sparkles, Loader } from 'lucide-react';
import { User, Role } from '../types';
import { getRoles, updateUser } from '../services/api';
import { Button } from '../components/Button';
import { generateUserBio } from '../services/geminiService';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      const data = await getRoles();
      setRoles(data);
    };
    fetchRoles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedUser = { ...user, avatarUrl: base64String };
        try {
          await updateUser(updatedUser);
          onUpdate(updatedUser);
        } catch (e) {
          alert("Failed to upload avatar");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const updatedUser = { ...user, name, email, bio };
    try {
      await updateUser(updatedUser);
      onUpdate(updatedUser);
      alert("Profile updated successfully!");
    } catch (e) {
      alert("Failed to update profile");
    }
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    const roleName = roles.find(r => r.id === user.roleId)?.name || 'Member';
    const aiBio = await generateUserBio(user, roleName);
    setBio(aiBio);
    setIsGeneratingBio(false);
  };

  const userRoleName = roles.find(r => r.id === user.roleId)?.name || 'Loading...';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                <img src={user.avatarUrl || ''} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Camera size={16} className="text-gray-600" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="mb-1">
               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                 {userRoleName}
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

               <div className="pt-4">
                 <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                   <Key size={16} className="mr-2" /> Security
                 </h3>
                 <Button variant="secondary" size="sm" className="w-full justify-start">
                   Change Password
                 </Button>
               </div>
            </div>

            {/* Right Column: Bio & AI */}
            <div className="space-y-4">
               <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
                  <button 
                    onClick={handleGenerateBio}
                    disabled={isGeneratingBio}
                    className="flex items-center text-xs text-purple-600 font-medium hover:text-purple-700 disabled:opacity-50"
                  >
                    {isGeneratingBio ? (
                      <Loader size={12} className="mr-1 animate-spin" />
                    ) : (
                      <Sparkles size={12} className="mr-1" />
                    )}
                    Generate with AI
                  </button>
                </div>
                <textarea 
                  rows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  This bio is visible on your public profile. Use the AI tool to generate a professional summary based on your activity.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <Button onClick={handleSave} size="lg">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};