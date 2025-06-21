import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const userDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsAuthenticated(true);
          setUserRole(user.role);
          setUsername(user.username);
          setName(user.name || '');
          setProfileImage(user.profileImage || '');
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
          setUserRole(null);
          setUsername('');
          setName('');
          setProfileImage('');
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUsername('');
        setName('');
        setProfileImage('');
      }
    };

    // Check on mount
    checkAuth();

    // Check every second for changes
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername('');
    setName('');
    setProfileImage('');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    // Fetch categories for the navbar dropdown
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories for navbar:', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsCategoryDropdownOpen(false);
    setIsSearchResultsOpen(false);
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
    setIsDropdownOpen(false);
    setIsSearchResultsOpen(false);
  };

  // Function to fetch search results
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

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set new timeout
    window.searchTimeout = setTimeout(() => {
      fetchSearchResults(query);
    }, 300); // 300ms delay
  };

  // Handle search submit on Enter key press
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchResults([]);
      setIsSearchResultsOpen(false);
      setIsMenuOpen(false);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (blog) => {
    navigate(`/blogs?search=${encodeURIComponent(blog.title)}`);
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchResultsOpen(false);
    setIsMenuOpen(false);
  };

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchResultsOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (categoryId) => {
    navigate(`/blogs?category=${categoryId}`);
    setIsCategoryDropdownOpen(false);
    setIsMenuOpen(false);
  };

return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl font-sans sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300 tracking-tight">
                BlogHub
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {userRole === 'admin' ? (
              <>
                <Link 
                  to="/admin" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="relative search-container" ref={searchContainerRef}>
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchSubmit}
                    className="w-64 p-2 pl-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600 transition-all duration-300"
                  />
                  {isSearchResultsOpen && searchResults.length > 0 && (
                    <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-xl z-20 max-h-96 overflow-y-auto border border-gray-200">
                      {searchResults.map(blog => (
                        <Link
                          key={blog._id}
                          to={`/blogs/${blog._id}`}
                          onClick={() => handleSearchResultClick(blog)}
                          className="block px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{blog.title}</div>
                          {blog.description && (
                            <div className="text-sm text-gray-500 truncate">{blog.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <Link 
                  to="/blogs" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700"
                >
                  Home
                </Link>
                <div className="relative group" ref={categoryDropdownRef}>
                  <button
                    onClick={toggleCategoryDropdown}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700 flex items-center"
                  >
                    Categories
                    <svg
                      className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 transition-opacity duration-200">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {categories.map((cat) => (
                          <a
                            key={cat._id}
                            href="#"
                            onClick={() => handleCategorySelect(cat._id)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            role="menuitem"
                          >
                            <span className="font-medium">{cat.name}</span>
                            {cat.description && (
                              <span className="block text-xs text-gray-500 mt-1">{cat.description}</span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {isAuthenticated && (
                  <Link 
                    to="/create" 
                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Create Blog
                  </Link>
                )}
              
                {isAuthenticated ? (
                  <div className="relative group" ref={userDropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700 focus:outline-none"
                    >
                      {profileImage ? (
                        <img 
                          src={`http://localhost:5000/uploads/${profileImage}`}
                          alt={username}
                          className="w-8 h-8 rounded-full mr-2 object-cover border-2 border-gray-600 hover:border-blue-500 transition-all duration-300"
                          onError={(e) => { e.target.src = `https://via.placeholder.com/32?text=${username.charAt(0).toUpperCase()}`; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm mr-2 hover:bg-blue-700 transition-all duration-300">
                          {username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="hidden sm:inline">{name || username}</span>
                      <svg
                        className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 transition-opacity duration-200">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <Link
                            to="/profile"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            role="menuitem"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMenuOpen(false);
                            }}
                          >
                            <div className="font-medium">Your Profile</div>
                            <div className="text-xs text-gray-500 mt-1">View and edit profile</div>
                          </Link>
                          <Link
                            to="/my-blogs"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            role="menuitem"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMenuOpen(false);
                            }}
                          >
                            <div className="font-medium">My Blogs</div>
                            <div className="text-xs text-gray-500 mt-1">Manage your content</div>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            role="menuitem"
                          >
                            <div className="font-medium">Logout</div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link 
                      to="/login" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {userRole === 'admin' ? (
              <>
                <Link 
                  to="/admin" 
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/blogs" 
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/create" 
                    className="block px-3 py-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                  >
                    Create Blog
                  </Link>
                )}
                <div className="relative mb-2" ref={searchContainerRef}>
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchSubmit}
                    className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600 transition-all duration-300"
                  />
                  {isSearchResultsOpen && searchResults.length > 0 && (
                    <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-20 max-h-60 overflow-y-auto border border-gray-200">
                      {searchResults.map(blog => (
                        <Link
                          key={blog._id}
                          to={`/blogs/${blog._id}`}
                          onClick={() => handleSearchResultClick(blog)}
                          className="block px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{blog.title}</div>
                          {blog.description && (
                            <div className="text-sm text-gray-500 truncate">{blog.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    onClick={toggleCategoryDropdown}
                    className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300 flex items-center justify-between"
                  >
                    Categories
                    <svg
                      className={`ml-1 h-5 w-5 transform transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="mt-1 pb-1 rounded-md bg-gray-700 animate-fade-in-down">
                      {categories.map((cat) => (
                        <a
                          key={cat._id}
                          href="#"
                          onClick={() => handleCategorySelect(cat._id)}
                          className="block px-4 py-3 text-base text-gray-300 hover:text-white hover:bg-gray-600 transition-colors duration-200"
                          role="menuitem"
                        >
                          <div className="font-medium">{cat.name}</div>
                          {cat.description && (
                            <div className="text-sm text-gray-400 mt-1">{cat.description}</div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {isAuthenticated ? (
                  <div className="relative group" ref={userDropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300 focus:outline-none"
                    >
                      {profileImage ? (
                        <img 
                          src={`http://localhost:5000/uploads/${profileImage}`}
                          alt={username}
                          className="w-8 h-8 rounded-full mr-3 object-cover border-2 border-gray-600 hover:border-blue-500 transition-all duration-300"
                          onError={(e) => { e.target.src = `https://via.placeholder.com/32?text=${username.charAt(0).toUpperCase()}`; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base mr-3 hover:bg-blue-700 transition-all duration-300">
                          {username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {name || username}
                      <svg
                        className={`ml-1 h-5 w-5 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="pl-4 pr-2 py-2 space-y-2 bg-gray-750 rounded-md mt-1">
                        <Link
                          to="/profile"
                          className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          <div className="font-medium">Your Profile</div>
                          <div className="text-sm text-gray-400 mt-1">View and edit profile</div>
                        </Link>
                        <Link
                          to="/my-blogs"
                          className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          <div className="font-medium">My Blogs</div>
                          <div className="text-sm text-gray-400 mt-1">Manage your content</div>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                        >
                          <div className="font-medium">Logout</div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="block px-3 py-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;