import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient, { getImageUrl } from '../services/api';

const BlogCard = ({ blog, onLike, formatDate }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(blog.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    setIsLiked(user && blog.likes?.includes(user.id));

    const fetchCommentCount = async () => {
      try {
        const res = await apiClient.get(`/comments/${blog._id}`);
        setCommentCount(res.data.length);
      } catch (err) {
        console.error('Failed to fetch comment count:', err);
        setCommentCount(0);
      }
    };

    fetchCommentCount();
  }, [blog]);

  const handleLikeClick = () => {
    if (!currentUser) return;
    onLike(blog._id);
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = () => {
    const url = `${window.location.origin}/blogs/${blog._id}`;
    if (navigator.share) {
      navigator.share({ title: blog.title, text: blog.description, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert(`Link copied: ${url}`);
    }
  };

  return (
    <article className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20 hover:border-blue-500/30 group">
      {/* Image container with gradient overlay */}
      <div className="relative h-64 overflow-hidden">
        {blog.image && !imageError ? (
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title || 'Blog image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent opacity-80"></div>
        <div className="absolute top-4 left-4">
          <span className="bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
            {blog.category?.name || 'Car News'}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-gray-300 text-sm">
          {formatDate(blog.createdAt)}
        </div>
      </div>

      {/* Content container */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-3">
          <Link to={`/blogs/${blog._id}`} className="hover:text-blue-400 transition-colors duration-200">
            {blog.title || 'Untitled Blog'}
          </Link>
        </h2>

        <p className="text-gray-400 line-clamp-2 mb-4">
          {blog.description || 'No description available.'}
        </p>

        {/* Author and stats */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-400">
                {blog.user?.username || 'Anonymous'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLikeClick}
              className="flex items-center text-sm gap-1 group"
              disabled={!currentUser}
            >
              <svg
                className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400 group-hover:text-red-500'}`}
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span className={`text-gray-300 ${isLiked ? 'text-red-400' : ''}`}>{likeCount}</span>
            </button>

            <Link
              to={`/blogs/${blog._id}`}
              className="flex items-center text-sm gap-1 hover:text-blue-400"
            >
              <svg
                className="w-5 h-5 text-gray-400 hover:text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-gray-300">{commentCount}</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center text-sm gap-1 hover:text-green-400"
            >
              <svg
                className="w-5 h-5 text-gray-400 hover:text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;