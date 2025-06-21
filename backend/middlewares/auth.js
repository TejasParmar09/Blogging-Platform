const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  console.log('Auth middleware - Headers:', req.headers);
  
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret found');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', { id: decoded.id, username: decoded.username, role: decoded.role });
    
    // Fetch the full user object from the database
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ 
      message: "Invalid token",
      error: error.message 
    });
  }
};

module.exports = authMiddleware;
