import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        setCategories(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch categories');
      }
    };
    fetchCategories();

    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const response = await apiClient.get(`/blogs/${id}`);
          const blog = response.data;
          setFormData({
            title: blog.title,
            content: blog.content,
            description: blog.description,
            category: blog.category?._id || '',
          });
          if (blog.image) {
            setCurrentImage(blog.image);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch blog data');
          navigate('/my-blogs');
        }
      };
      fetchBlog();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      content,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.content || !formData.description || !formData.category) {
      setError('All fields (Title, Description, Content, Category) are required.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditing) {
        await apiClient.put(`/blogs/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Blog updated successfully!');
      } else {
        await apiClient.post('/blogs', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Blog created successfully!');
      }
      navigate('/my-blogs');
    } catch (err) {
      const errorMessage = err.response?.data?.message || `An error occurred while ${isEditing ? 'updating' : 'creating'} the post`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="min-h-screen bg-[#0f172a] py-10 px-4 text-gray-300 font-sans">
  <div className="max-w-4xl mx-auto bg-[#1e1e2f] rounded-2xl shadow-lg p-8 border border-[#2a2e45]">
    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
      {isEditing ? 'Edit Blog Post' : 'Create New Blog'}
    </h2>

    {error && (
      <div className="mb-6 bg-red-100/10 border border-red-500 text-red-400 p-4 rounded-md">
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-lg mb-2 text-gray-200">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-md bg-[#111827] border border-[#2c2f44] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter blog title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-lg mb-2 text-gray-200">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-3 rounded-md bg-[#111827] border border-[#2c2f44] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter blog description"
          required
        ></textarea>
      </div>

      {/* Image */}
      <div>
        <label className="block text-lg mb-2 text-gray-200">{isEditing ? 'Change Image' : 'Upload Image'}</label>
        {currentImage && !imageFile && (
          <div className="mb-4">
            <img
              src={`http://localhost:5000/${currentImage}`}
              alt="Current"
              className="w-32 h-32 object-cover rounded-md border border-gray-700"
            />
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-lg mb-2 text-gray-200">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-md bg-[#111827] border border-[#2c2f44] focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div>
        <label className="block text-lg mb-2 text-gray-200">Content</label>
        <div className="bg-[#111827] border border-[#2c2f44] rounded-md overflow-hidden">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleEditorChange}
            modules={modules}
            className="h-64 text-white"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-10">
        <button
          type="button"
          onClick={() => navigate('/my-blogs')}
          className="px-6 py-2 rounded-md border border-gray-600 hover:bg-gray-800 text-gray-300 transition duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default CreatePost; 