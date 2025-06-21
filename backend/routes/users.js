const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const authMiddleware = require('../middlewares/auth');
const { updateUserProfile, upload, getUsers } = require('../controller/userController');

// @route   GET /api/users
// @desc    Get all users (for admin or debugging)
// @access  Private (admin or authenticated user)
router.get('/', authMiddleware, getUsers);

// @route   GET /api/users/:id/blogs
// @desc    Get blogs by a specific user
// @access  Public
router.get('/:id/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.params.id }).populate('user').populate('category');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user and their associated data
// @access  Private (admin or user themselves)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Ensure the user deleting is the authenticated user or an admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    await User.findByIdAndDelete(req.params.id);
    await Blog.deleteMany({ user: req.params.id });
    await Comment.deleteMany({ user: req.params.id });
    await Notification.deleteMany({ user: req.params.id });
    res.json({ message: 'User and associated data deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/users/:id
// @desc    Update user profile
// @access  Private
router.patch('/:id', authMiddleware, upload.single('profileImage'), updateUserProfile);

module.exports = router; 