const express = require('express');
const router = express.Router();
const { createComment, getCommentsByBlogId, getAllComments, deleteComment } = require('../controller/CommentController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, createComment);
router.get('/:blogId', getCommentsByBlogId);
router.get('/', authMiddleware, getAllComments);
router.delete('/:id', authMiddleware, deleteComment);

module.exports = router;