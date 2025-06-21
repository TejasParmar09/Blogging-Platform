import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import DOMPurify from 'dompurify';

const MyBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedContent, setExpandedContent] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBlogs = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        let user = null;

        if (!token) {
          setError('Please sign in to view your blogs.');
          navigate('/login');
          return;
        }

        if (userData) {
          try {
            user = JSON.parse(userData);
          } catch (e) {
            setError('Invalid user data. Please sign in again.');
            navigate('/login');
            return;
          }
        }

        if (!user || !user.id) {
          setError('Please sign in to view your blogs.');
          navigate('/login');
          return;
        }

        const response = await apiClient.get(`/blogs/user/${user.id}`);
        setPosts(response.data);

        const commentsData = {};
        for (const post of response.data) {
          try {
            const commentResponse = await apiClient.get(`/comments/${post._id}`);
            commentsData[post._id] = commentResponse.data;
          } catch {
            commentsData[post._id] = [];
          }
        }
        setComments(commentsData);
      } catch (err) {
        const errMessage = err.response?.data?.message || 'Failed to fetch blogs. Please try again.';
        setError(errMessage);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyBlogs();
  }, [navigate]);

  const handleDeleteBlog = useCallback(async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await apiClient.delete(`/blogs/${blogId}`);
      setPosts(posts.filter(post => post._id !== blogId));
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[blogId];
        return newComments;
      });
      setError('');
    } catch (err) {
      const errMessage = err.response?.data?.message || 'Failed to delete blog.';
      setError(errMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  }, [posts, navigate]);

  const handleDeleteComment = useCallback(async (blogId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await apiClient.delete(`/comments/${commentId}`);
      setComments(prev => ({
        ...prev,
        [blogId]: prev[blogId].filter(comment => comment._id !== commentId),
      }));
      setError('');
    } catch (err) {
      const errMessage = err.response?.data?.message || 'Failed to delete comment.';
      setError(errMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  }, [comments, navigate]);

  const toggleContent = (blogId) => {
    setExpandedContent(prev => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0B1120]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B1120] text-white px-6 text-center">
        <h2 className="text-red-500 text-2xl font-bold mb-6 animate-pulse">{error}</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-10 text-center">My Blogs</h1>

        {posts.length === 0 ? (
          <div className="bg-[#1F2937] p-10 rounded-xl shadow-xl text-center border border-gray-700">
            <p className="text-gray-300 text-lg mb-6">You haven't created any blogs yet.</p>
            <Link
              to="/create"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full transition-transform transform hover:scale-105"
            >
              Create Your First Blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-[#1F2937] rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border border-gray-700"
              >
                <div className="relative h-48 w-full">
                  <img
                    src={post.image ? `http://localhost:5000/${post.image}` : 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error')}
                  />
                  <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                    {post.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-extrabold text-white truncate">
                      <Link to={`/blogs/${post._id}`} className="hover:text-blue-400 transition">
                        {post.title}
                      </Link>
                    </h2>
                    <span className="text-sm text-gray-400">{formatDate(post.createdAt)}</span>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {post.description || post.content.replace(/<[^>]+>/g, '')}
                  </p>

                  {expandedContent[post._id] && (
                    <div
                      className="text-gray-200 prose max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                    />
                  )}

                  <button
                    onClick={() => toggleContent(post._id)}
                    className="text-blue-400 hover:text-blue-500 font-medium mb-4 flex items-center gap-1"
                  >
                    {expandedContent[post._id] ? 'Hide Content' : 'View Content'}
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedContent[post._id] ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Comments</h3>
                    {comments[post._id]?.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {comments[post._id].map((comment) => (
                          <div
                            key={comment._id}
                            className="bg-gray-800 p-3 rounded-md flex justify-between items-start"
                          >
                            <div>
                              <p className="text-sm font-semibold text-blue-400">
                                {comment.user?.username || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-200">{comment.content}</p>
                              <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                            </div>
                            {comment.user?._id === JSON.parse(localStorage.getItem('user'))?.id && (
                              <button
                                onClick={() => handleDeleteComment(post._id, comment._id)}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No comments yet.</p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Link
                      to={`/edit/${post._id}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm transition-transform transform hover:scale-105"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteBlog(post._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm transition-transform transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;