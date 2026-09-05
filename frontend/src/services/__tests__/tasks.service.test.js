import api from '../api';
import { getTasks, createTask, updateTask, deleteTask } from '../tasks.service';

jest.mock('../api');

describe('tasks.service', () => {
  it('getTasks returns the task list on success', async () => {
    const tasks = [{ id: 1, title: 'Buy milk' }];
    api.get.mockResolvedValueOnce({ data: tasks });

    await expect(getTasks()).resolves.toEqual(tasks);
    expect(api.get).toHaveBeenCalledWith('/tasks');
  });

  it('getTasks normalizes a server message error', async () => {
    api.get.mockRejectedValueOnce({ response: { data: { message: 'Unauthorized' } } });

    await expect(getTasks()).rejects.toThrow('Unauthorized');
  });

  it('getTasks normalizes a server error field when message is absent', async () => {
    api.get.mockRejectedValueOnce({ response: { data: { error: 'Bad request' } } });

    await expect(getTasks()).rejects.toThrow('Bad request');
  });

  it('getTasks falls back to a generic message for network errors', async () => {
    api.get.mockRejectedValueOnce(new Error());

    await expect(getTasks()).rejects.toThrow('An unexpected network error occurred.');
  });

  it('createTask posts task data', async () => {
    const taskData = { title: 'New task' };
    api.post.mockResolvedValueOnce({ data: { id: 1, ...taskData } });

    const result = await createTask(taskData);

    expect(api.post).toHaveBeenCalledWith('/tasks', taskData);
    expect(result).toEqual({ id: 1, ...taskData });
  });

  it('updateTask puts to the task id endpoint', async () => {
    api.put.mockResolvedValueOnce({ data: { id: 3, done: true } });

    const result = await updateTask(3, { done: true });

    expect(api.put).toHaveBeenCalledWith('/tasks/3', { done: true });
    expect(result).toEqual({ id: 3, done: true });
  });

  it('deleteTask deletes the task by id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });

    const result = await deleteTask(9);

    expect(api.delete).toHaveBeenCalledWith('/tasks/9');
    expect(result).toEqual({ success: true });
  });
});
