import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import toast from 'react-hot-toast';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (token && userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Logged out successfully!');
    navigate('/login');
  }, [navigate]);

  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchResultsOpen(false);
      return;
    }
    try {
      const response = await apiClient.get(`/blogs/search?q=${encodeURIComponent(query.trim())}`);
      setSearchResults(response.data);
      setIsSearchResultsOpen(true);
    } catch (err) {
      console.error('Failed to fetch search results:', err);
      setSearchResults([]);
      setIsSearchResultsOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchSearchResults(query);
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchResults([]);
      setIsSearchResultsOpen(false);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-400">
              BlogHub
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={searchContainerRef}>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
                className="w-64 p-2 pl-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isSearchResultsOpen && searchResults.length > 0 && (
                <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-xl z-20 max-h-96 overflow-y-auto">
                  {searchResults.map(blog => (
                    <Link
                      key={blog._id}
                      to={`/blogs/${blog._id}`}
                      onClick={() => {
                        setIsSearchResultsOpen(false);
                        setSearchTerm('');
                      }}
                      className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                    >
                      <div className="font-medium">{blog.title}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <NavLink to="/blogs" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>Home</NavLink>
            {isAuthenticated && user ? (
              <>
                <NavLink to="/create" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800">Create Blog</NavLink>
                <NotificationDropdown user={user} />
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center">
                    <img 
                      src={user.profileImage ? `http://localhost:5000/uploads/${user.profileImage}` : `https://via.placeholder.com/32?text=${user.username.charAt(0).toUpperCase()}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-600 group-hover:border-blue-500"
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-semibold text-white truncate">{user.name || user.username}</p>
                      </div>
                      <Link to="/my-blogs" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">My Blogs</Link>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</Link>
                      {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Admin</Link>}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Login</Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700">Register</Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="relative" ref={searchContainerRef}>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchSubmit}
                  className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
                />
            </div>
            <NavLink to="/blogs" className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>Home</NavLink>
            {isAuthenticated && user ? (
              <>
                <NavLink to="/create" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">Create Blog</NavLink>
                <Link to="/my-blogs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">My Blogs</Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">Profile</Link>
                {user.role === 'admin' && <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">Admin</Link>}
                <div className="px-3 pt-2">
                  <NotificationDropdown user={user} isMobile={true}/>
                </div>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 