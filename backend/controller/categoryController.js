const Category = require('../models/Category');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create categories' });
    }
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    console.log('getCategories: Request received. User:', req.user);
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update categories' });
    }
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete categories' });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
