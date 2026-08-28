import api from './api';

const normalizeError = (error) => new Error(
  error.response?.data?.message || error.response?.data?.error ||
  error.message || 'An unexpected network error occurred.'
);

export const getTasks = async () => {
  try { return (await api.get('/tasks')).data; } catch (error) { throw normalizeError(error); }
};

export const createTask = async (taskData) => {
  try { return (await api.post('/tasks', taskData)).data; } catch (error) { throw normalizeError(error); }
};

export const updateTask = async (id, taskData) => {
  try { return (await api.put(`/tasks/${id}`, taskData)).data; } catch (error) { throw normalizeError(error); }
};

export const deleteTask = async (id) => {
  try { return (await api.delete(`/tasks/${id}`)).data; } catch (error) { throw normalizeError(error); }
};
