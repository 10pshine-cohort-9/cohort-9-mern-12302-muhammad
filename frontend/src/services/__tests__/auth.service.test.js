import api from '../api';
import authService from '../auth.service';

jest.mock('../api');

describe('authService', () => {
  it('register posts to /auth/signup and returns response data', async () => {
    const userData = { name: 'Jane', email: 'jane@example.com', password: 'password123' };
    const responseData = { user: { id: 1, ...userData } };
    api.post.mockResolvedValueOnce({ data: responseData });

    const result = await authService.register(userData);

    expect(api.post).toHaveBeenCalledWith('/auth/signup', userData);
    expect(result).toEqual(responseData);
  });

  it('login posts credentials and returns response data', async () => {
    const credentials = { email: 'jane@example.com', password: 'password123' };
    const responseData = { token: 'abc123', user: { id: 1 } };
    api.post.mockResolvedValueOnce({ data: responseData });

    const result = await authService.login(credentials);

    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(result).toEqual(responseData);
  });

  it('login throws the server error payload on failure', async () => {
    const serverError = { message: 'Invalid credentials' };
    api.post.mockRejectedValueOnce({ response: { data: serverError } });

    await expect(authService.login({ email: 'x', password: 'y' })).rejects.toEqual(serverError);
  });

  it('login throws the raw error when there is no response payload', async () => {
    const networkError = new Error('Network Error');
    api.post.mockRejectedValueOnce(networkError);

    await expect(authService.login({ email: 'x', password: 'y' })).rejects.toBe(networkError);
  });

  it('getMe fetches the current user', async () => {
    const responseData = { user: { id: 1, name: 'Jane' } };
    api.get.mockResolvedValueOnce({ data: responseData });

    const result = await authService.getMe();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(responseData);
  });

  it('updateProfile puts profile data', async () => {
    const payload = { name: 'Jane Doe' };
    const responseData = { user: { id: 1, name: 'Jane Doe' } };
    api.put.mockResolvedValueOnce({ data: responseData });

    const result = await authService.updateProfile(payload);

    expect(api.put).toHaveBeenCalledWith('/auth/profile', payload);
    expect(result).toEqual(responseData);
  });
});
