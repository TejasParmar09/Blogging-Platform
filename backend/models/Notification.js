const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  type: { type: String, enum: ['like', 'comment'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);