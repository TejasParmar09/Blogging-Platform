import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import BlogCard from '../components/BlogCard';

const UserBlogs = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const [blogsRes, userRes] = await Promise.all([
        apiClient.get(`/blogs/user/${userId}`),
        apiClient.get(`/users/${userId}`),
      ]);
      setBlogs(blogsRes.data);
      setUser(userRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user blogs');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserBlogs();
  }, [fetchUserBlogs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLike = async (blogId) => {
    try {
      const response = await apiClient.patch(`/blogs/${blogId}/like`);
      setBlogs((prevBlogs) =>
        prevBlogs.map((post) => (post._id === blogId ? response.data : post))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to like/unlike blog');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a0f1c] to-[#1e293b]">
        <div className="h-12 w-12 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gradient-to-br from-[#0a0f1c] to-[#1e293b] px-4">
        <p className="text-red-400 text-xl font-semibold mb-4">{error}</p>
        <button
          onClick={fetchUserBlogs}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] to-[#1e293b] text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
            <button
                onClick={() => navigate('/admin?tab=users')}
                className="flex items-center text-blue-400 hover:text-blue-300 transition duration-200"
            >
                &larr; Back to Users
            </button>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">
            Blogs by {user?.username || 'User'}
          </h1>
          <p className="text-gray-400">
            A collection of all posts from this author.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-gray-300 text-lg">This user has not posted any blogs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <BlogCard
                key={post._id}
                blog={post}
                onLike={handleLike}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBlogs; 