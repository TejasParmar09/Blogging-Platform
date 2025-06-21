import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import BlogDetail from './pages/BlogDetail';
import MyBlogs from './pages/MyBlogs';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import UserBlogs from './pages/UserBlogs';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-gray-50 flex flex-col">
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        
        {/* Make main take full width and expand to fill remaining height */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-blogs"
              element={
                <PrivateRoute>
                  <MyBlogs />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/blogs/user/:userId"
              element={
                <PrivateRoute requiredRole="admin">
                  <UserBlogs />
                </PrivateRoute>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
