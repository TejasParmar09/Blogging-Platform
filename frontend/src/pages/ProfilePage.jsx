import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    profileImage: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        username: storedUser.username || '',
        name: storedUser.name || '',
        email: storedUser.email || '',
        profileImage: storedUser.profileImage || '',
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }));
    } else {
      setFormData(prev => ({ ...prev, profileImage: user.profileImage || '' }));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.profileImage && typeof formData.profileImage !== 'string') {
      data.append('profileImage', formData.profileImage);
    } else if (formData.profileImage === '' && user.profileImage) {
      data.append('removeProfileImage', 'true');
    }

    try {
      const response = await apiClient.patch(`/users/${user.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen text-white">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0e1525] flex items-center justify-center p-6">
      <div className="bg-[#1b2333] text-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold text-blue-500 mb-8 text-center">My Profile</h1>

        {message && (
          <div className="bg-green-900 border-l-4 border-green-500 text-green-300 p-4 rounded-lg mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-red-300 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-8">
          <img
            src={user.profileImage ? `http://localhost:5000/uploads/${user.profileImage}` : `https://via.placeholder.com/150?text=${user.username.charAt(0).toUpperCase()}`}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/150?text=${user.username.charAt(0).toUpperCase()}`;
            }}
          />
          <h2 className="text-2xl font-bold mt-4">{user.username}</h2>
          <p className="text-sm text-gray-300">{user.email}</p>
        </div>

        {!isEditing ? (
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-4">
              <strong>Name:</strong> {user.name || 'Not set'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl transition duration-300"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-xl transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#2c3447] text-white border border-gray-600 rounded-lg"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#2c3447] text-white border border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#2c3447] text-white border border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-1">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg"
                >
                  Choose Image
                </button>
                {formData.profileImage && typeof formData.profileImage !== 'string' && (
                  <span className="text-sm text-gray-300">{formData.profileImage.name}</span>
                )}
                {formData.profileImage && typeof formData.profileImage === 'string' && (
                  <span className="text-sm text-gray-400">Current: {formData.profileImage.split('/').pop()}</span>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition duration-300"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    username: user.username || '',
                    name: user.name || '',
                    email: user.email || '',
                    profileImage: user.profileImage || '',
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
