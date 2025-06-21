import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import BlogCard from '../components/BlogCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialLoadHandled = useRef(false);

  const fetchPosts = useCallback(async (category = '') => {
    try {
      setLoading(true);
      const url = category ? `/blogs?category=${category}` : '/blogs';
      const response = await apiClient.get(url);
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async (query) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/blogs/search?q=${encodeURIComponent(query)}`);
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesRes = await apiClient.get('/categories');
        setCategories([{ _id: '', name: 'All' }, ...categoriesRes.data]);
      } catch (err) {
        setError('Failed to fetch categories');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    if (searchQuery) {
      if (!initialLoadHandled.current) {
        fetchSearchResults(searchQuery);
        initialLoadHandled.current = true;
      } else {
        navigate('/blogs', { replace: true });
      }
    } else {
      initialLoadHandled.current = false;
      setSelectedCategory(categoryQuery || '');
      fetchPosts(categoryQuery || '');
    }
  }, [searchParams, fetchSearchResults, fetchPosts, navigate]);

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
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === blogId ? response.data : post))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to like/unlike blog');
    }
  };

  const handleDelete = async (blogId) => {
    // You can implement delete logic here
    console.log('Delete blog with ID:', blogId);
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
          onClick={() => {
            const searchQuery = searchParams.get('search');
            if (searchQuery) {
              fetchSearchResults(searchQuery);
            } else {
              fetchPosts(searchParams.get('category') || '');
            }
          }}
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
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">
            {searchParams.get('search') ? 'Search Results' : 'Latest Blogs'}
          </h1>
          <p className="text-gray-400">
            {searchParams.get('search')
              ? `Results for "${searchParams.get('search')}"`
              : 'Read insights, stories, and updates from our authors'}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => {
                setSelectedCategory(category._id);
                navigate(`/blogs?category=${category._id}`);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${selectedCategory === category._id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* No Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-gray-300 text-lg">No blogs found.</p>
            <p className="text-gray-500 mt-2">
              Try selecting a different category or creating a new post.
            </p>
          </div>
        ) : (
          // Blog Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard
                key={post._id}
                blog={post}
                onLike={handleLike}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
