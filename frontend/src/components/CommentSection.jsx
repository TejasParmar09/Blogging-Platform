import { useState, useEffect } from 'react';
import apiClient from '../services/api';

const CommentSection = ({ blogId, currentUser, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await apiClient.get(`/comments/${blogId}`);
        setComments(response.data);
      } catch (err) {
        setError('Failed to fetch comments.');
      }
    };
    fetchComments();
  }, [blogId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) {
      setError('You must be logged in to comment.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/comments', {
        blogId,
        text: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment('');
      if (onCommentAdded) {
        onCommentAdded(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-4">Comments</h3>
      {currentUser ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 rounded-md bg-[#111827] border border-[#2c2f44] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
            rows="3"
            placeholder="Add a comment..."
            required
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      ) : (
        <p className="text-gray-400 mb-6">You must be logged in to post a comment.</p>
      )}

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center mb-2">
                <p className="font-semibold text-blue-400">{comment.user?.username || 'Anonymous'}</p>
                <span className="text-gray-500 text-sm ml-auto">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
