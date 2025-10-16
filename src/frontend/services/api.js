import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://peer-evaluation-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
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


// Fetch a single course by ID
export const getCourseById = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export default api;