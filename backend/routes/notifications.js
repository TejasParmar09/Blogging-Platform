const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controller/notificationController');
const authMiddleware = require('../middlewares/auth');

console.log('Type of authMiddleware in notifications.js:', typeof authMiddleware);
console.log('Type of getNotifications in notifications.js:', typeof getNotifications);

// @route   GET /api/notifications
// @desc    Get notifications for the authenticated user
// @access  Private
router.get('/', authMiddleware, getNotifications);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch('/:id/read', authMiddleware, markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authMiddleware, deleteNotification);

module.exports = router; 