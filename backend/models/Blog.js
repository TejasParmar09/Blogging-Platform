const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String },
  image: { type: String }, // Simulating image URL
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  validateBeforeSave: false
});

BlogSchema.pre('validate', function(next) {
  if (this.isNew) {
    if (!this.title || !this.description || !this.content || !this.category || !this.user) {
      return next(new Error('Missing required fields'));
    }
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);