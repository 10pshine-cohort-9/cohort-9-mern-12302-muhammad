import axios from 'axios';

// Configure standard Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if backend port changes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT from local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
