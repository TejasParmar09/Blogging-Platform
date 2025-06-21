import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import RecommendedBlogCard from '../components/RecommendedBlogCard';
import CommentSection from '../components/CommentSection';
import { FaHeart, FaRegHeart, FaCommentAlt, FaSmile, FaArrowLeft, FaShare } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { getImageUrl } from '../services/api';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [recommendedBlogs, setRecommendedBlogs] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user || null);
  }, []);

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post) {
      setLikes(post.likes?.length || 0);
      if (currentUser) {
        setLiked(post.likes?.includes(currentUser.id));
      } else {
        setLiked(false);
      }
      if (post.category?._id) {
        fetchRecommendedBlogs(post.category._id);
      }
    }
  }, [post, currentUser]);

  const fetchPost = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/blogs/${id}`);
      setPost(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedBlogs = async (categoryId) => {
    try {
      if (categoryId) {
        const res = await apiClient.get(`/blogs?category=${categoryId}&exclude=${id}`);
        setRecommendedBlogs(res.data);
      } else {
        const latest = await getLatestBlogs();
        setRecommendedBlogs(latest);
      }
    } catch (err) {
      console.error('Failed to fetch recommended blogs:', err);
      // Fallback to latest blogs in case of any error
      const latest = await getLatestBlogs();
      setRecommendedBlogs(latest);
    }
  };

  const getLatestBlogs = async () => {
    try {
      const res = await apiClient.get('/blogs?limit=5');
      return res.data;
    } catch {
      return [];
    }
  };

  const handleLikeToggle = async () => {
    if (!currentUser) {
      setError('Please login to like posts');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to like posts');
      return;
    }

    try {
      const res = await apiClient.patch(
        `/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedLikes = res.data.likes;
      setLikes(updatedLikes.length);
      setLiked(updatedLikes.includes(currentUser.id));
      setPost(prev => ({ ...prev, likes: updatedLikes }));
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to like posts');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      } else {
        setError('Failed to update like status');
      }
    }
  };

  const handleCommentAdded = (newComment) => {
    setPost(prevPost => ({
      ...prevPost,
      comments: [...prevPost.comments, newComment],
    }));
  };

  const handleShare = () => {
    const url = `${window.location.origin}/blogs/${id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse text-blue-400 text-xl">Loading...</div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400 text-xl">
      {error || 'Blog not found'}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>

          <div className="mb-8 relative">
            {post.image ? (
              <img
                src={getImageUrl(post.image)}
                alt={post.title || 'Blog image'}
                className="w-full h-96 object-cover rounded-xl border border-gray-700 shadow-lg"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-700 text-gray-400 rounded-xl border border-gray-700">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                {post.category?.name || 'Car News'}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-blue-400 font-medium">{post.user?.username || 'Anonymous'}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition duration-200`}
              >
                {liked ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FaRegHeart className="text-xl" />
                )}
                <span>{likes} Likes</span>
              </button>

              <div className="flex items-center gap-2 text-gray-400">
                <FaCommentAlt className="text-xl" />
                <span>{post.comments?.length || 0} Comments</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition duration-200"
              >
                <FaShare className="text-xl" />
                <span>Share</span>
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-lg text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            ></div>
          </div>

          <CommentSection blogId={id} currentUser={currentUser} onCommentAdded={handleCommentAdded} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4">Recommended For You</h3>
            <div className="space-y-4">
              {recommendedBlogs.length > 0 ? (
                recommendedBlogs.map((blog) => (
                  <RecommendedBlogCard key={blog._id} blog={blog} />
                ))
              ) : (
                <p className="text-gray-500">No recommendations available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;