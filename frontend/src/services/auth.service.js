import api from './api';

const register = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const updateProfile = async (data) => {
  try {
    const response = await api.put('/auth/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const authService = {
  register,
  login,
  getMe,
  updateProfile,
};

export default authService;
