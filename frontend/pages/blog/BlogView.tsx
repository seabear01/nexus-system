import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Tag, Edit, Share2 } from 'lucide-react';
import { BlogPost, BlogStatus } from '../../types';
import { getBlogById } from '../../services/blogService';
import { Button } from '../../components/Button';

interface BlogViewProps {
  id: string;
  onNavigate: (path: string, id?: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ id, onNavigate }) => {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getBlogById(id);
        setBlog(data);
      } catch (e) {
        console.error("Failed to load blog post", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
          Loading post...
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Post not found</h3>
        <p className="mt-2 text-gray-500">The blog post you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => onNavigate('blogs')}
          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          Return to Blog List
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: BlogStatus) => {
    const styles = {
      [BlogStatus.PUBLISHED]: 'bg-emerald-100 text-emerald-800',
      [BlogStatus.DRAFT]: 'bg-amber-100 text-amber-800',
      [BlogStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('blogs')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </button>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('blog-edit', blog.id)}>
            <Edit size={14} className="mr-2" /> Edit Post
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner/Header Area */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="flex items-center justify-between mb-4">
             <div className="flex gap-2">
                {blog.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    <Tag size={10} className="mr-1" />
                    {tag}
                  </span>
                ))}
             </div>
             {getStatusBadge(blog.status)}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                <User size={16} />
              </div>
              <span className="font-medium text-gray-700">
                {blog.authorId.split('-')[1] || 'Administrator'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-gray-400" />
              <time dateTime={blog.createdAt}>
                {new Date(blog.createdAt).toLocaleDateString(undefined, { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </time>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <div className="px-8 py-6 bg-blue-50/30 border-b border-blue-50">
            <p className="text-lg text-gray-700 leading-relaxed font-medium italic border-l-4 border-blue-400 pl-4">
              "{blog.excerpt}"
            </p>
          </div>
        )}

        {/* Post Body */}
        <div className="px-8 py-8">
          <div className="prose prose-slate max-w-none prose-lg text-gray-600">
            <div className="whitespace-pre-wrap leading-loose">
              {blog.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <div>
            Last updated: {new Date(blog.updatedAt).toLocaleString()}
          </div>
          <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
            <Share2 size={16} className="mr-2" /> Share
          </button>
        </div>
      </article>
    </div>
  );
};