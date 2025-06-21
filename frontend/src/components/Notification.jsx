import { useState, useEffect } from 'react';
import axios from 'axios';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/notifications', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="border p-4 mb-4 rounded shadow bg-yellow-100">
      <h3 className="font-semibold">Notifications</h3>
      {notifications.map(n => (
        <p key={n._id}>{n.message}</p>
      ))}
    </div>
  );
};

export default Notification;