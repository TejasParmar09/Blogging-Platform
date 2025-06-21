import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import toast from 'react-hot-toast';
import { FaBell, FaThumbsUp, FaComment, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleToggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to mark notification as read.');
    }
    setIsOpen(false); // Optionally close dropdown after click
  };

  const handleClearAll = async () => {
    try {
      await apiClient.delete('/notifications');
      setNotifications([]);
      toast.success('All notifications cleared.');
    } catch (error) {
      toast.error('Failed to clear notifications.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupNotifications = (notifications) => {
    return notifications.reduce((acc, notification) => {
      const { type } = notification;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(notification);
      return acc;
    }, {});
  };

  const groupedNotifications = groupNotifications(notifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getGroupIcon = (type) => {
    switch (type) {
      case 'like':
        return <FaThumbsUp className="h-5 w-5 text-blue-400" />;
      case 'comment':
        return <FaComment className="h-5 w-5 text-green-400" />;
      default:
        return <FaBell className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggleDropdown} className="relative p-2 rounded-full text-gray-400 hover:text-white focus:outline-none">
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20"
          >
            <div className="p-3 flex justify-between items-center border-b border-gray-700">
              <h3 className="font-semibold text-white text-lg">Notifications</h3>
              <button onClick={handleClearAll} className="text-sm text-blue-400 hover:underline">Clear All</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {Object.keys(groupedNotifications).length > 0 ? (
                Object.entries(groupedNotifications).map(([type, group]) => (
                  <div key={type} className="border-b border-gray-700 last:border-b-0">
                    <div className="p-3 bg-gray-700/50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         {getGroupIcon(type)}
                         <h4 className="font-bold text-white capitalize">{type}s</h4>
                       </div>
                       <span className="text-sm font-bold text-white bg-blue-600 rounded-full px-2 py-0.5">{group.length}</span>
                    </div>
                    {group.map(notification => (
                      <Link
                        key={notification._id}
                        to={`/blogs/${notification.blog}`}
                        onClick={() => handleNotificationClick(notification._id)}
                        className={`flex items-start px-4 py-3 hover:bg-gray-700 transition-colors duration-200 ${!notification.isRead ? 'bg-blue-900/50' : ''}`}
                      >
                        <div className="flex-grow">
                          <p className="text-sm text-gray-200">
                            <span className="font-bold">{notification.from?.username || 'Someone'}</span>
                            {` ${notification.message}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-10">You have no new notifications.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown; 