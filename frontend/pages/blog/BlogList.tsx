import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, Globe, Archive, Eye } from 'lucide-react';
import { BlogPost, BlogStatus } from '../../types';
import { getBlogs, deleteBlog } from '../../services/blogService';
import { Button } from '../../components/Button';

interface BlogListProps {
  onNavigate: (path: string, id?: string) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ onNavigate }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await getBlogs(1, 100, searchTerm);
      setBlogs(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deleteBlog(id);
      fetchBlogs();
    }
  };

  const getStatusIcon = (status: BlogStatus) => {
    switch (status) {
      case BlogStatus.PUBLISHED: return <Globe size={14} className="mr-1" />;
      case BlogStatus.ARCHIVED: return <Archive size={14} className="mr-1" />;
      default: return <FileText size={14} className="mr-1" />;
    }
  };

  const getStatusColor = (status: BlogStatus) => {
    switch (status) {
      case BlogStatus.PUBLISHED: return 'bg-emerald-100 text-emerald-800';
      case BlogStatus.ARCHIVED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage content, announcements, and updates.</p>
        </div>
        <Button onClick={() => onNavigate('blog-edit')}>
          <Plus size={20} className="mr-2" />
          Create Post
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No blog posts found.</td></tr>
              ) : (
                blogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p 
                          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => onNavigate('blog-view', blog.id)}
                        >
                          {blog.title}
                        </p>
                        <p className="text-gray-500 text-xs truncate max-w-xs">{blog.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                        {getStatusIcon(blog.status)}
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                         {blog.authorId.split('-')[1] || 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(blog.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => onNavigate('blog-view', blog.id)} 
                          className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => onNavigate('blog-edit', blog.id)} 
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)} 
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};