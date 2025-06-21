const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

exports.createBlog = async (req, res) => {
  try {
    console.log('Current user during blog creation:', req.user);
    console.log('Received req.body:', req.body);
    console.log('Received req.file:', req.file);

    const { title, content, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'An image is required for the blog post.' });
    }

    const image = path.join('uploads', req.file.filename).replace(/\\/g, '/');

    console.log('Image path being saved to DB:', image);

    if (!title?.trim() || !content?.trim() || !description?.trim() || !category?.trim()) {
      console.error('Validation failed: Missing required fields', { title, content, description, category });
      return res.status(400).json({ message: 'All fields (Title, Description, Content, Category) are required.' });
    }

    const blog = await Blog.create({
      title,
      content,
      description,
      image,
      user: req.user?.id,
      category,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error('Error creating blog:', err);

    if (err.name === 'MulterError') {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }

    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Validation failed', details: errors });
    }

    if (err.name === 'CastError' && err.path === 'user') {
      return res.status(400).json({ message: 'Invalid user ID format', details: err.message });
    }

    res.status(500).json({ message: 'An error occurred while creating the blog post' });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    console.log('getBlogs: Request received. User:', req.user);
    const { category, search, exclude } = req.query;
    const filter = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    }

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
      filter._id = { $ne: new mongoose.Types.ObjectId(exclude) };
    }

    console.log('Backend fetching blogs with filter:', filter);
    const blogs = await Blog.find(filter)
      .populate('user category')
      .populate('comments')
      .select('_id title description content image user category comments likes createdAt')
      .sort({ createdAt: -1 });
    console.log('Blogs data being sent to frontend (getBlogs):', blogs);
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    console.log('Fetching blog with ID:', req.params.id);
    const blog = await Blog.findById(req.params.id).populate('user category').populate('comments');

    if (!blog) {
      console.log('Blog not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Blog not found' });
    }

    console.log('Found blog:', {
      id: blog._id,
      title: blog.title,
      hasContent: !!blog.content,
      contentLength: blog.content?.length,
      content: blog.content?.substring(0, 100) + '...',
      user: blog.user ? {
        id: blog.user._id,
        username: blog.user.username
      } : null,
      category: blog.category ? {
        id: blog.category._id,
        name: blog.category.name
      } : null
    });

    if (!blog.content) {
      blog.content = '';
    }

    res.json(blog);
  } catch (err) {
    console.error('Error fetching single blog:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBlogContent = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findById(blogId).select('content');

    if (!blog) {
      return res.status(404).json({ message: 'Blog content not found.' });
    }

    res.json({ content: blog.content });
  } catch (err) {
    console.error('Error fetching blog content:', err);
    res.status(500).json({ message: 'Error fetching blog content', error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, description, category } = req.body;

    // Validate required fields
    if (!title?.trim() || !content?.trim() || !description?.trim() || !category?.trim()) {
      return res.status(400).json({ message: 'All fields (Title, Description, Content, Category) are required.' });
    }

    const updateData = { title, content, description, category };

    // Handle image upload if a new file is provided
    if (req.file) {
      // Delete old image if it exists
      const oldBlog = await Blog.findById(id);
      if (oldBlog && oldBlog.image) {
        const oldImagePath = path.join(__dirname, '../', oldBlog.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is authorized to update this blog
    if (blog.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);

    if (error.name === 'MulterError') {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: error.message });
    }

    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: 'Validation failed', details: errors });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    res.status(500).json({ message: 'Error updating blog' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(400).json({ message: 'Blog not found' });
    }

    if (blog.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    if (blog.image) {
      const imagePath = path.join(__dirname, '../', blog.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isLiked = blog.likes.includes(userId);
    if (isLiked) {
      blog.likes.pull(userId);
    } else {
      blog.likes.push(userId);
      if (blog.user.toString() !== userId) {
        const notification = new Notification({
          user: blog.user,
          from: userId,
          blog: blogId,
          type: 'like',
          message: `liked your blog "${blog.title}"`,
        });
        await notification.save();
      }
    }

    await blog.save();

    const updatedBlog = await Blog.findById(blogId)
      .populate('user category')
      .populate('comments');

    res.json(updatedBlog);
  } catch (error) {
    console.error('Error liking/unliking blog:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.searchBlogs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    const blogs = await Blog.find({
      title: { $regex: searchRegex }
    })
      .populate('user', 'username')
      .populate('category', 'name')
      .populate('comments')
      .select('+image')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('Blogs data being sent to frontend (searchBlogs):', blogs);
    res.json(blogs);
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({ message: 'Error searching blogs' });
  }
};

exports.getBlogsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these blogs' });
    }

    const blogs = await Blog.find({ user: userId })
      .populate('user category')
      .populate('comments')
      .select('+image')
      .sort({ createdAt: -1 });

    console.log(`Blogs for user ${userId}:`, blogs);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};