import axios from 'axios';

const API_URL = 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Remove any leading slashes and ensure proper URL format
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_URL}/${cleanPath}`;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('apiClient: Added Authorization header with token');
    } else {
      console.log('apiClient: No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('apiClient: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('apiClient: Response error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    return Promise.reject(error);
  }
);

export default apiClient;