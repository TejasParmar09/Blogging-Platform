import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const isAuthenticated = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && (!user || user.role !== requiredRole)) {
    // Redirect to home or an unauthorized page if authenticated but role doesn't match
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute; 