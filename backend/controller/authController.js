const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  const { username, email, password, role } = req.body;
  
  console.log('Registration attempt:', { username, email, role });
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate required fields
    if (!username || !email || !password) {
      console.log('Missing required fields:', { username, email, password });
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          username: !username ? 'Username is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Create new user
    const user = await User.create({ username, email, password, role });
    console.log('User created successfully:', { id: user._id, email: user.email });
    
    // Generate token with role included
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2d' }
    );
    
    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        details: validationErrors
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already registered'
      });
    }
    
    res.status(400).json({ 
      message: 'Registration failed',
      details: err.message 
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token with role included
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, login };
