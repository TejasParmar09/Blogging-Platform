const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// @desc    Update user profile
// @route   PATCH /api/users/:id
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    let newProfileImageFilename = req.file ? req.file.filename : null;

    // Ensure the user updating is the authenticated user or an admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields that are allowed to be changed
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    
    // Handle profile image update
    if (newProfileImageFilename) {
      // Delete old image if it exists and is not the default
      if (user.profileImage && user.profileImage !== '') {
        const oldImagePath = path.join(__dirname, '../uploads', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Store only the filename
      user.profileImage = newProfileImageFilename;
    } else if (req.body.removeProfileImage === 'true') {
      // This handles if the user wants to remove the existing image without uploading a new one
      if (user.profileImage && user.profileImage !== '') {
        const oldImagePath = path.join(__dirname, '../uploads', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.profileImage = '';
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage, // This will now be just the filename
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.upload = upload;

exports.getUsers = async (req, res) => {
  try {
    console.log('getUsers: Request received. User:', req.user);
    const users = await User.find().select('-password'); // Exclude passwords from response
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
}; 