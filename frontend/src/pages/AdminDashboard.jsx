import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkAdminRole = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') {
        navigate('/');
      } else {
        setUserRole(user.role);
      }
    };
    checkAdminRole();
    window.addEventListener('storage', checkAdminRole);
    return () => {
      window.removeEventListener('storage', checkAdminRole);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole(null); // Clear user role on logout
    navigate('/login');
  };

  const Sidebar = () => (
    <div className="w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold text-blue-400">Admin Panel</h2>
      </div>
      <nav className="flex-grow py-6">
        <SidebarLink tab="dashboard" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Dashboard" />
        <SidebarLink tab="categories" icon="M7 7h.01M7 3h5.5c.583 0 1.047.427 1.228 1.006l2.126 5.109C16.29 9.61 16 10.222 16 11c0 1.105.895 2 2 2h4v-2c0-.552-.448-1-1-1h-3V5c0-1.657-1.343-3-3-3H7c-2.209 0-4 1.791-4 4v10c0 2.209 1.791 4 4 4h10c2.209 0 4-1.791 4-4v-2h-4c-1.105 0-2 .895-2 2s.895 2 2 2h4V19c0 1.105-.895 2-2 2h-10c-2.209 0-4-1.791-4-4V7c0-2.209 1.791-4 4-4zm5 14h-4c-.552 0-1-.448-1-1s.448-1 1-1h4c.552 0 1 .448 1 1s-.448 1-1 1z" label="Categories" />
        <SidebarLink tab="users" icon="M17 20h2a2 2 0 002-2V7.429a2 2 0 00-.609-1.429L14.591 3.409A2 2 0 0013.172 3H5a2 2 0 00-2 2v12a2 2 0 002 2h2m0 0l.417-.384M17 20v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2m3-2l.417-.384m-4.665 0L12 14m0 0l4.665-.384M12 14V8m0 6a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2z" label="Users" />
        <SidebarLink tab="blogs" icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V5m0 6H9m6 0h2m-6 0h2m-6 0h2" label="Blogs" />
      </nav>
    </div>
  );

  const SidebarLink = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center w-full py-3 px-6 text-left transition-all duration-200
        ${activeTab === tab ? 'bg-gray-700 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'}
      `}
    >
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
      </svg>
      {label}
    </button>
  );

  // Dashboard Section
  const DashboardSection = ({ userRole }) => {
    const [stats, setStats] = useState({ users: 0, blogs: 0, categories: 0, comments: 0 });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchStats = async () => {
        setLoading(true);
        setError('');

        if (userRole !== 'admin') {
          setError('Unauthorized: Only admins can access these stats.');
          setLoading(false);
          return;
        }

        try {
          const [usersRes, blogsRes, categoriesRes, commentsRes] = await Promise.all([
            apiClient.get('/users'),
            apiClient.get('/blogs'),
            apiClient.get('/categories'),
            apiClient.get('/comments'),
          ]);
          setStats({
            users: usersRes.data.length,
            blogs: blogsRes.data.length,
            categories: categoriesRes.data.length,
            comments: commentsRes.data.length,
          });
        } catch (err) {
          if (err.response?.status === 403) {
            setError('Unauthorized: Only admins can access this page.');
            // navigate('/login'); // Removed, as this section does not have access to navigate
          } else {
            setError(err.response?.data?.message || 'Failed to fetch stats');
          }
        } finally {
          setLoading(false);
        }
      };

      if (userRole) { // Only fetch if userRole is determined
        fetchStats();
      }
    }, [userRole]);

    return (
      <div className="animate-fade-in p-6 bg-gray-900">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard Overview</h1>
        {error && (
          <div className="mb-6 bg-red-100/10 border-l-4 border-red-500 text-red-400 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-gray-400 text-center text-lg">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Total Users" value={stats.users} colorClass="text-blue-400" />
            <DashboardCard title="Total Blogs" value={stats.blogs} colorClass="text-green-400" />
            <DashboardCard title="Total Categories" value={stats.categories} colorClass="text-yellow-400" />
            <DashboardCard title="Total Comments" value={stats.comments} colorClass="text-indigo-400" />
          </div>
        )}
      </div>
    );
  };

  const DashboardCard = ({ title, value, colorClass }) => (
    <div className="bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-scale-up border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
      <p className={`text-4xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );

  // Categories Section
  const CategoriesSection = ({ userRole }) => {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchCategories = async () => {
        setLoading(true);
        try {
          if (userRole !== 'admin') {
            setError('Unauthorized: Only admins can manage categories.');
            setLoading(false);
            return;
          }
          const response = await apiClient.get('/categories');
          setCategories(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch categories');
        } finally {
          setLoading(false);
        }
      };

      if (userRole) { // Only fetch if userRole is determined
        fetchCategories();
      }
    }, [userRole]); // Dependency on userRole

    const addCategory = async () => {
      if (!categoryName.trim()) {
        setError('Category name cannot be empty');
        return;
      }

      try {
        const response = await apiClient.post(
          '/categories',
          { name: categoryName }
        );
        setCategories([...categories, response.data]);
        setCategoryName('');
        setError('');
        toast.success('Category added successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to add category');
        toast.error(err.response?.data?.message || 'Failed to add category');
      }
    };

    const deleteCategory = async (categoryId) => {
      try {
        await apiClient.delete(`/categories/${categoryId}`);
        setCategories(categories.filter(c => c._id !== categoryId));
        toast.success('Category deleted successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
        toast.error(err.response?.data?.message || 'Failed to delete category');
      }
    };

    return (
      <div className="animate-fade-in p-6 bg-gray-900">
        <h1 className="text-4xl font-bold text-white mb-8">Manage Categories</h1>
        {error && (
          <div className="mb-6 bg-red-100/10 border-l-4 border-red-500 text-red-400 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        <div className="bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Add New Category</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
            <button
              onClick={addCategory}
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition-all duration-300 shadow-md"
            >
              Add Category
            </button>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Categories List</h2>
          {loading ? (
            <div className="text-gray-400 text-center text-lg">Loading...</div>
          ) : categories.length === 0 ? (
            <p className="text-gray-400">No categories found.</p>
          ) : (
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c._id} className="flex justify-between items-center border-b border-gray-700 py-3 last:border-b-0">
                  <span className="text-white text-lg">{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Users Section
  const UsersSection = ({ userRole }) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [userBlogs, setUserBlogs] = useState([]);
    const [showUserBlogsModal, setShowUserBlogsModal] = useState(false);

    useEffect(() => {
      const fetchUsers = async () => {
        setLoading(true);
        setError('');

        if (userRole !== 'admin') {
          setError('Unauthorized: Only admins can view users.');
          setLoading(false);
          navigate('/login'); // Redirect to login if not admin
          return;
        }

        try {
          const response = await apiClient.get('/users');
          console.log('Fetched users:', response.data);
          setUsers(response.data);
        } catch (err) {
          console.error('Error fetching users:', err);
          setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
          setLoading(false);
        }
      };

      if (userRole) { // Only fetch if userRole is determined
        fetchUsers();
      }
    }, [userRole, navigate]); // Add navigate to dependency array

    const viewUserBlogs = (userId) => {
      navigate(`/blogs/user/${userId}`);
    };

    const deleteUser = async (userId) => {
      if (window.confirm('Are you sure you want to delete this user and all their data? This action cannot be undone.')) {
        try {
          await apiClient.delete(`/users/${userId}`);
          setUsers(users.filter(u => u._id !== userId));
          toast.success('User deleted successfully!');
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete user');
          toast.error(err.response?.data?.message || 'Failed to delete user');
        }
      }
    };

    return (
      <div className="animate-fade-in p-6 bg-gray-900">
        <h1 className="text-4xl font-bold text-white mb-8">Manage Users</h1>
        {error && (
          <div className="mb-6 bg-red-100/10 border-l-4 border-red-500 text-red-400 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-gray-400 text-center text-lg">Loading...</div>
        ) : users.length === 0 ? (
          <p className="text-gray-400">No users found.</p>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => viewUserBlogs(user._id)} className="text-blue-400 hover:text-blue-300">View Blogs</button>
                        <button onClick={() => deleteUser(user._id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Blogs Section
  const BlogsSection = ({ userRole }) => {
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchBlogs = async () => {
        setLoading(true);
        setError('');
        try {
          if (userRole !== 'admin') {
            setError('Unauthorized: Only admins can manage blogs.');
            setLoading(false);
            return;
          }
          const response = await apiClient.get('/blogs');
          setBlogs(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch blogs');
        } finally {
          setLoading(false);
        }
      };
      if (userRole) { // Only fetch if userRole is determined
        fetchBlogs();
      }
    }, [userRole]);

    const deleteBlog = async (blogId) => {
      if (window.confirm('Are you sure you want to delete this blog post?')) {
        try {
          await apiClient.delete(`/blogs/${blogId}`);
          setBlogs(blogs.filter(b => b._id !== blogId));
          toast.success('Blog deleted successfully!');
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete blog');
          toast.error(err.response?.data?.message || 'Failed to delete blog');
        }
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return (
      <div className="animate-fade-in p-6 bg-gray-900">
        <h1 className="text-4xl font-bold text-white mb-8">Manage Blogs</h1>
        {error && (
          <div className="mb-6 bg-red-100/10 border-l-4 border-red-500 text-red-400 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-gray-400 text-center text-lg">Loading...</div>
        ) : blogs.length === 0 ? (
          <p className="text-gray-400">No blogs found.</p>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Author</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {blogs.map(blog => (
                    <tr key={blog._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{blog.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{blog.user?.username || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(blog.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link to={`/blogs/${blog._id}`} className="text-blue-400 hover:text-blue-300">View</Link>
                        <button onClick={() => deleteBlog(blog._id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection userRole={userRole} />;
      case 'categories':
        return <CategoriesSection userRole={userRole} />;
      case 'users':
        return <UsersSection userRole={userRole} />;
      case 'blogs':
        return <BlogsSection userRole={userRole} />;
      default:
        return <DashboardSection userRole={userRole} />;
    }
  };

  if (userRole === null) {
    return <div className="flex justify-center items-center h-screen text-xl">Checking authentication...</div>; // Or a loading spinner
  }

  return (
    <div className="flex bg-gray-900 text-white h-screen">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;