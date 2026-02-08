import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { BlogPost, BlogStatus, User } from '../../types';
import { saveBlog, getBlogById } from '../../services/blogService';
import { Button } from '../../components/Button';

interface BlogEditorProps {
  id?: string;
  currentUser: User | null;
  onNavigate: (path: string) => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ id, currentUser, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    status: BlogStatus.DRAFT,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const data = await getBlogById(id);
          setFormData(data);
        } catch (e) {
          alert('Failed to load post');
          onNavigate('blogs');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Title and Content are required");

    setLoading(true);
    try {
      await saveBlog({
        ...formData,
        authorId: formData.authorId || currentUser?.id || 'unknown',
        // If it's an update, id is already in formData from load
      });
      alert("Post saved successfully!");
      onNavigate('blogs');
    } catch (e) {
      alert("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) });
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate('blogs')}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 hidden sm:inline">
            {formData.status === BlogStatus.DRAFT ? 'Unpublished' : 'Live'}
          </span>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
               <input 
                 type="text" 
                 required
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                 placeholder="Enter a catchy title..."
                 value={formData.title}
                 onChange={e => setFormData({...formData, title: e.target.value})}
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
               <textarea 
                 required
                 rows={12}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                 placeholder="Write your story here..."
                 value={formData.content}
                 onChange={e => setFormData({...formData, content: e.target.value})}
               />
             </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-900">Publishing</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as BlogStatus})}
                >
                  {Object.values(BlogStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Short Excerpt</label>
                 <textarea 
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                   placeholder="Summary for lists and SEO..."
                   value={formData.excerpt}
                   onChange={e => setFormData({...formData, excerpt: e.target.value})}
                 />
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-900">Metadata</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                   <input 
                     type="text" 
                     className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                     placeholder="Add tag..."
                     value={tagInput}
                     onChange={e => setTagInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                   />
                   <button onClick={handleAddTag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 text-blue-400 hover:text-blue-600">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
