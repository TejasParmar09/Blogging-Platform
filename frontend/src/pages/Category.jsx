import { useState, useEffect } from 'react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import apiClient from '../services/api'; // Using apiClient for consistency

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [errorCategories, setErrorCategories] = useState('');
  const [errorBlogs, setErrorBlogs] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories('');
      try {
        const res = await apiClient.get('/categories');
        setCategories([{ _id: '', name: 'All Categories' }, ...res.data]);
      } catch (err) {
        setErrorCategories(err.response?.data?.message || 'Failed to fetch categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoadingBlogs(true);
      setErrorBlogs('');
      try {
        const url = selectedCategory ? `/blogs?category=${selectedCategory}` : '/blogs';
        const res = await apiClient.get(url);
        setBlogs(res.data);
      } catch (err) {
        setErrorBlogs(err.response?.data?.message || 'Failed to fetch blogs');
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, [selectedCategory]);

  // Note: handleLike and handleDelete logic needs to be robust, 
  // potentially requiring a full blog object update or refetch for accurate state.
  const handleLike = async (blogId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to like a blog.');
        return;
      }
      const response = await apiClient.post(`/blogs/${blogId}/like`, {});
      setBlogs(blogs.map(b => b._id === blogId ? response.data : b));
    } catch (err) {
      console.error('Failed to like blog:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to like blog.');
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to delete a blog.');
        return;
      }
      await apiClient.delete(`/blogs/${blogId}`);
      setBlogs(blogs.filter(b => b._id !== blogId));
    } catch (err) {
      console.error('Failed to delete blog:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to delete blog.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-background to-neutral-100 py-8 font-sans px-4">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-heading font-bold text-text-heading mb-4 animate-fade-in">Browse Blogs by Category</h1>
          <p className="text-lg text-neutral-medium animate-fade-in animation-delay-100">Filter and discover great content.</p>
        </div>

        {errorCategories && (
          <div className="mb-6 bg-status-error-100 border-l-4 border-status-error-500 text-status-error-700 p-4 rounded-lg animate-fade-in">
            {errorCategories}
          </div>
        )}

        <div className="mb-8 flex justify-center">
          {loadingCategories ? (
            <div className="text-neutral-medium">Loading categories...</div>
          ) : (
            <div className="relative inline-block w-full max-w-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block appearance-none w-full bg-text-white border border-neutral-light text-text-body py-3 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-400 focus:border-transparent transition duration-200 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          )}
        </div>

        {loadingBlogs ? (
          <div className="flex justify-center items-center min-h-[40vh] bg-neutral-background rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary-600"></div>
          </div>
        ) : errorBlogs ? (
          <div className="text-center py-12 bg-status-error-100 border-l-4 border-status-error-500 text-status-error-700 p-4 rounded-lg animate-fade-in">
            {errorBlogs}
            <button
              onClick={() => setSelectedCategory(selectedCategory)} // Re-fetch current category blogs
              className="mt-4 bg-brand-primary-600 text-text-white px-4 py-2 rounded-lg hover:bg-brand-primary-700 transition duration-200"
            >
              Try Again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 bg-text-white rounded-xl shadow-lg animate-fade-in border border-neutral-light">
            <p className="text-neutral-medium text-xl">No blogs found for this category.</p>
            <p className="text-neutral-light mt-2">Try selecting a different category or create a new blog!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onLike={handleLike}
                onDelete={handleDelete}
                formatDate={formatDate} // Pass formatDate if BlogCard needs it
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;