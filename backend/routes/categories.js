const express = require('express');
const router = express.Router();
const { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } = require('../controller/categoryController');
const authMiddleware = require('../middlewares/auth');

console.log('Type of authMiddleware in categories.js:', typeof authMiddleware);
console.log('Type of createCategory in categories.js:', typeof createCategory);

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (admin only)
router.post('/', authMiddleware, createCategory);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/:id
// @desc    Get a single category by ID
// @access  Public
router.get('/:id', getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (admin only)
router.put('/:id', authMiddleware, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (admin only)
router.delete('/:id', authMiddleware, deleteCategory);

module.exports = router; 
