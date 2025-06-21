import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAdminRole = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') {
        navigate('/'); // Redirect to home if not admin
      } else {
        setUserRole(user.role);
      }
    };

    checkAdminRole();

    // Listen for changes in localStorage (e.g., from login/logout on other pages)
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
    <div className="w-64 bg-neutral-dark text-text-white flex flex-col min-h-screen shadow-lg sticky top-16 z-10">
      <div className="p-6 border-b border-neutral-medium">
        <h2 className="text-3xl font-heading font-bold text-brand-accent-300">Admin Panel</h2>
      </div>
      <nav className="flex-grow py-6">
        <SidebarLink tab="dashboard" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Dashboard" />
        <SidebarLink tab="categories" icon="M7 7h.01M7 3h5.5c.583 0 1.047.427 1.228 1.006l2.126 5.109C16.29 9.61 16 10.222 16 11c0 1.105.895 2 2 2h4v-2c0-.552-.448-1-1-1h-3V5c0-1.657-1.343-3-3-3H7c-2.209 0-4 1.791-4 4v10c0 2.209 1.791 4 4 4h10c2.209 0 4-1.791 4-4v-2h-4c-1.105 0-2 .895-2 2s.895 2 2 2h4V19c0 1.105-.895 2-2 2h-10c-2.209 0-4-1.791-4-4V7c0-2.209 1.791-4 4-4zm5 14h-4c-.552 0-1-.448-1-1s.448-1 1-1h4c.552 0 1 .448 1 1s-.448 1-1 1z" label="Categories" />
        <SidebarLink tab="users" icon="M17 20h2a2 2 0 002-2V7.429a2 2 0 00-.609-1.429L14.591 3.409A2 2 0 0013.172 3H5a2 2 0 00-2 2v12a2 2 0 002 2h2m0 0l.417-.384M17 20v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2m3-2l.417-.384m-4.665 0L12 14m0 0l4.665-.384M12 14V8m0 6a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2z" label="Users" />
        <SidebarLink tab="blogs" icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V5m0 6H9m6 0h2m-6 0h2m-6 0h2" label="Blogs" />
        <SidebarLink tab="comments" icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 1.085-.297 2.115-.828 3.031L16 19.5l-4 2.5-4-2.5L3.828 15.031C3.297 14.115 3 13.085 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" label="Comments" />
      </nav>
    </div>
  );

  const SidebarLink = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center w-full py-3 px-6 text-left transition-all duration-200
        ${activeTab === tab ? 'bg-neutral-medium text-brand-accent-300 font-semibold border-l-4 border-brand-accent-400' : 'text-neutral-light hover:bg-neutral-medium hover:text-brand-accent-300'}
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
      <div className="animate-fade-in p-6 bg-neutral-background">
        <h1 className="text-4xl font-heading font-bold text-text-heading mb-8">Dashboard Overview</h1>
        {error && (
          <div className="mb-6 bg-status-error-100 border-l-4 border-status-error-500 text-status-error-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-neutral-medium text-center text-lg">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Total Users" value={stats.users} colorClass="text-brand-primary-600" />
            <DashboardCard title="Total Blogs" value={stats.blogs} colorClass="text-brand-accent-600" />
            <DashboardCard title="Total Categories" value={stats.categories} colorClass="text-brand-secondary-600" />
            <DashboardCard title="Total Comments" value={stats.comments} colorClass="text-status-info-600" />
          </div>
        )}
      </div>
    );
  };

  const DashboardCard = ({ title, value, colorClass }) => (
    <div className="bg-text-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-scale-up">
      <h2 className="text-lg font-semibold text-text-heading mb-2">{title}</h2>
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
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to add category');
      }
    };

    const deleteCategory = async (categoryId) => {
      try {
        await apiClient.delete(`/categories/${categoryId}`);
        setCategories(categories.filter(c => c._id !== categoryId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    };

    return (
      <div className="animate-fade-in p-6 bg-neutral-background">
        <h1 className="text-4xl font-heading font-bold text-text-heading mb-8">Manage Categories</h1>
        {error && (
          <div className="mb-6 bg-status-error-100 border-l-4 border-status-error-500 text-status-error-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        <div className="bg-text-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-text-heading mb-4">Add New Category</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent-400 transition duration-200 text-text-body placeholder-neutral-medium"
            />
            <button
              onClick={addCategory}
              className="bg-brand-accent-500 text-text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-accent-600 transition-all duration-300 shadow-md"
            >
              Add Category
            </button>
          </div>
        </div>
        <div className="bg-text-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-text-heading mb-4">Categories List</h2>
          {loading ? (
            <div className="text-neutral-medium text-center text-lg">Loading...</div>
          ) : categories.length === 0 ? (
            <p className="text-neutral-medium">No categories found.</p>
          ) : (
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c._id} className="flex justify-between items-center border-b border-neutral-light py-3 last:border-b-0">
                  <span className="text-text-body text-lg">{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c._id)}
                    className="bg-status-error-500 text-text-white px-4 py-2 rounded-lg hover:bg-status-error-600 transition duration-200 shadow-sm"
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

    const viewUserBlogs = async (userId) => {
      navigate(`/blogs/user/${userId}`);
    };

    const deleteUser = async (userId) => {
      if (!window.confirm('Are you sure you want to delete this user and all their blogs?')) return;

      try {
        await apiClient.delete(`/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    };

    return (
      <div className="animate-fade-in p-6 bg-neutral-background">
        <h1 className="text-4xl font-heading font-bold text-text-heading mb-8">Manage Users</h1>
        {error && (
          <div className="mb-6 bg-status-error-100 border-l-4 border-status-error-500 text-status-error-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-neutral-medium text-center text-lg">Loading...</div>
        ) : users.length === 0 ? (
          <p className="text-neutral-medium">No users found.</p>
        ) : (
          <div className="overflow-x-auto bg-text-white rounded-xl shadow-md p-6">
            <table className="min-w-full divide-y divide-neutral-light">
              <thead className="bg-neutral-lightest">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-text-white divide-y divide-neutral-light">
                {console.log('Rendering users:', users)}
                {users.map(user => {
                  console.log('User object in map:', user);
                  return (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewUserBlogs(user._id)}
                          className="text-brand-primary-600 hover:text-brand-primary-900 mr-4"
                        >
                          View Blogs
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-status-error-600 hover:text-status-error-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      if (!window.confirm('Are you sure you want to delete this blog?')) return;
      try {
        await apiClient.delete(`/blogs/${blogId}`);
        setBlogs(blogs.filter(blog => blog._id !== blogId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete blog');
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
      <div className="animate-fade-in p-6 bg-neutral-background">
        <h1 className="text-4xl font-heading font-bold text-text-heading mb-8">Manage Blogs</h1>
        {error && (
          <div className="mb-6 bg-status-error-100 border-l-4 border-status-error-500 text-status-error-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        <div className="bg-text-white rounded-xl shadow-md p-6">
          {loading ? (
            <div className="text-neutral-medium text-center text-lg">Loading...</div>
          ) : blogs.length === 0 ? (
            <p className="text-neutral-medium">No blogs found.</p>
          ) : (
            <div className="space-y-4">
              {blogs.map(blog => (
                <div key={blog._id} className="border border-neutral-light rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-text-heading">{blog.title}</h3>
                    <p className="text-neutral-medium text-sm">By {blog.user?.username || 'Anonymous'} - {formatDate(blog.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => deleteBlog(blog._id)}
                    className="bg-status-error-500 text-text-white px-4 py-2 rounded-lg hover:bg-status-error-600 transition duration-200 shadow-sm"
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

  // Comments Section
  const CommentsSection = ({ userRole }) => {
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchComments = async () => {
        setLoading(true);
        setError('');
        try {
          if (userRole !== 'admin') {
            setError('Unauthorized: Only admins can view comments.');
            setLoading(false);
            return;
          }
          // Fetch all comments (new endpoint)
          const response = await apiClient.get('/comments');
          console.log('Fetched comments:', response.data);
          setComments(response.data);
        } catch (err) {
          console.error('Error fetching comments:', err);
          setError(err.response?.data?.message || 'Failed to fetch comments');
        } finally {
          setLoading(false);
        }
      };

      if (userRole) {
        fetchComments();
      }
    }, [userRole]);

    const deleteComment = async (commentId) => {
      try {
        await apiClient.delete(`/comments/${commentId}`);
        setComments(comments.filter(c => c._id !== commentId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete comment');
      }
    };

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
      <div className="animate-fade-in p-6 bg-neutral-background">
        <h1 className="text-4xl font-heading font-bold text-text-heading mb-8">Manage Comments</h1>
        {error && (
          <div className="mb-6 bg-status-error-100 border-l-4 border-status-error-500 text-status-error-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-neutral-medium text-center text-lg">Loading...</div>
        ) : comments.length === 0 ? (
          <p className="text-neutral-medium">No comments found.</p>
        ) : (
          <div className="overflow-x-auto bg-text-white rounded-xl shadow-md p-6">
            <table className="min-w-full divide-y divide-neutral-light">
              <thead className="bg-neutral-lightest">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Blog Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-text-white divide-y divide-neutral-light">
                {console.log('Rendering comments:', comments)}
                {comments.map(comment => {
                  console.log('Comment user data:', comment.user);
                  return (
                    <tr key={comment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{comment.content}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{comment.user?.username || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{comment.user?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{comment.blog?.title || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-body">{formatDate(comment.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => deleteComment(comment._id)}
                          className="text-status-error-600 hover:text-status-error-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      case 'comments':
        return <CommentsSection userRole={userRole} />;
      default:
        return <DashboardSection userRole={userRole} />;
    }
  };

  if (userRole === null) {
    return <div className="flex justify-center items-center h-screen text-xl">Checking authentication...</div>; // Or a loading spinner
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {userRole && renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;