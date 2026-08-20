import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const authService = {
  register,
  login,
  getMe,
};

export default authService;
