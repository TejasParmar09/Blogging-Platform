import { useState, useEffect } from 'react';
import axios from 'axios';

const Comments = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/comments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        const userComments = res.data.filter(c => c.user._id === JSON.parse(localStorage.getItem('user'))?.id);
        setComments(userComments);
      })
      .catch(err => console.error(err));
  }, []);

  const handleDelete = (commentId) => {
    axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => setComments(comments.filter(c => c._id !== commentId)))
      .catch(err => console.error(err));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Comments</h1>
      {comments.map(c => (
        <div key={c._id} className="border p-4 mb-4 rounded shadow">
          <p>{c.content}</p>
          <p>Blog: {c.blog.title}</p>
          <button onClick={() => handleDelete(c._id)} className="bg-red-500 text-white px-2 py-1 rounded">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Comments;