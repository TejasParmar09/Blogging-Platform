const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');

exports.createComment = async (req, res) => {
  const { text: content, blogId } = req.body;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(blogId).populate('user');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = new Comment({
      content,
      blog: blogId,
      user: userId,
    });

    await comment.save();

    blog.comments.push(comment._id);
    await blog.save();

    if (blog.user._id.toString() !== userId) {
      const notification = new Notification({
        user: blog.user._id,
        from: userId,
        blog: blogId,
        type: 'comment',
        message: `commented on your blog "${blog.title}"`,
      });
      await notification.save();
    }

    const populatedComment = await Comment.findById(comment._id).populate('user');
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getCommentsByBlogId = async (req, res) => {
  try {
    console.log('getCommentsByBlogId: Request received. User:', req.user);
    const comments = await Comment.find({ blog: req.params.blogId }).populate('user', 'username').sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments by blog ID:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    console.log('getAllComments: Request received. User:', req.user);
    // Ensure only admins can access all comments
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all comments.' });
    }
    const comments = await Comment.find()
      .populate('user', 'username name')
      .populate('blog', 'title')
      .sort({ createdAt: -1 });
    
    console.log('First comment user data:', comments[0]?.user); // Log the first comment's user data
    res.json(comments);
  } catch (err) {
    console.error('Error fetching all comments:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete comments.' });
    }
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: err.message });
  }
};