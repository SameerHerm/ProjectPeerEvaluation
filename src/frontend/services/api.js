import axios from 'axios';

// Detect environment and set appropriate API URL
// Check multiple indicators for production environment
const isProduction = process.env.NODE_ENV === 'production' || 
                    window.location.hostname.includes('onrender.com') ||
                    window.location.hostname !== 'localhost';

const API_BASE_URL = isProduction
  ? 'https://peer-evaluation-backend.onrender.com/api'
  : 'http://localhost:5000/api';

console.log('Environment Detection:', {
  NODE_ENV: process.env.NODE_ENV,
  hostname: window.location.hostname,
  isProduction: isProduction,
  API_BASE_URL: API_BASE_URL
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000, // 3 minute timeout for email sending in production
});

// Attach JWT token from localStorage/sessionStorage to every request
api.interceptors.request.use(
  (config) => {
    // Try localStorage first, then sessionStorage
    const token = localStorage.getItem('peer_eval_token') || sessionStorage.getItem('peer_eval_session');
    console.log('API Request - Token found:', !!token);
    console.log('API Request - Token preview:', token ? `${token.substring(0, 20)}...` : 'none');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response received:', response.status, response.config.method?.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      timeout: error.code === 'ECONNABORTED',
      networkError: error.code === 'ERR_NETWORK',
      baseURL: error.config?.baseURL
    });
    
    // Provide more specific error messages
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out - server may be overloaded or unresponsive');
      error.userMessage = 'Request timed out. The server may be busy, please try again.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Network error - cannot reach backend server');
      error.userMessage = `Cannot connect to backend server at ${error.config?.baseURL}. Please check if the backend is running.`;
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server error occurred. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// Fetch a single course by ID
export const getCourseById = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export default api;