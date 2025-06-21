const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  name: { 
    type: String, 
    trim: true,
    default: ''
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profileImage: { 
    type: String, 
    default: ''
  },
  role: { 
    type: String, 
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add pre-save middleware to log validation errors
userSchema.pre('save', function(next) {
  console.log('Attempting to save user:', {
    username: this.username,
    name: this.name,
    email: this.email,
    role: this.role,
    profileImage: this.profileImage
  });
  next();
});

module.exports = mongoose.model('User', userSchema);