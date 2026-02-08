import { BlogPost, PaginatedResponse } from '../types';
import * as mockDb from './mockDb';

// Reusing the toggle convention. In a real separated deployment, this config might be shared or env-based.
const USE_MOCK_API = true; 
const API_URL = 'http://localhost:3001/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Blog Service Error:", error);
    throw error;
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getBlogs = async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<BlogPost>> => {
  if (USE_MOCK_API) {
    await delay(300);
    return mockDb.getBlogs(page, limit, search);
  }
  return fetchJson<PaginatedResponse<BlogPost>>(`/blogs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
};

export const getBlogById = async (id: string): Promise<BlogPost> => {
  if (USE_MOCK_API) {
    const blog = mockDb.getBlogById(id);
    if (!blog) throw new Error("Blog not found");
    return blog;
  }
  return fetchJson<BlogPost>(`/blogs/${id}`);
};

export const saveBlog = async (blog: Partial<BlogPost>): Promise<BlogPost> => {
  if (USE_MOCK_API) {
    await delay(400);
    // MockDB expects a full object but handles missing IDs. Casting for mock simplicity.
    return mockDb.saveBlog(blog as BlogPost);
  }
  
  if (blog.id && !blog.id.startsWith('blog-')) {
    return fetchJson(`/blogs/${blog.id}`, { method: 'PUT', body: JSON.stringify(blog) });
  }
  return fetchJson('/blogs', { method: 'POST', body: JSON.stringify(blog) });
};

export const deleteBlog = async (id: string): Promise<void> => {
  if (USE_MOCK_API) {
    await delay(200);
    return mockDb.deleteBlog(id);
  }
  await fetchJson(`/blogs/${id}`, { method: 'DELETE' });
};
