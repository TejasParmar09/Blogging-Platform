const express = require('express');
const router = express.Router();
const { getBlogs, createBlog, getBlogById, updateBlog, deleteBlog, likeBlog, searchBlogs, getBlogsByUserId } = require('../controller/BlogController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');

console.log('Type of authMiddleware:', typeof authMiddleware);
console.log('Type of upload:', typeof upload);
console.log('Type of createBlog:', typeof createBlog);
console.log('Type of getBlogs:', typeof getBlogs);
console.log('Type of getBlogById:', typeof getBlogById);
console.log('Type of updateBlog:', typeof updateBlog);
console.log('Type of deleteBlog:', typeof deleteBlog);
console.log('Type of likeBlog:', typeof likeBlog);
console.log('Type of searchBlogs:', typeof searchBlogs);
console.log('Type of getBlogsByUserId:', typeof getBlogsByUserId);

router.get('/search', searchBlogs);
router.get('/', getBlogs);
router.post('/', authMiddleware, upload.single('image'), createBlog);
router.get('/:id', getBlogById);
router.get('/user/:userId', authMiddleware, getBlogsByUserId);
router.put('/:id', authMiddleware, upload.single('image'), updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);
router.patch('/:id/like', authMiddleware, likeBlog);

module.exports = router;