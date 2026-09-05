import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import useAuth from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

const renderLogin = () => render(
  <MemoryRouter>
    <Login />
  </MemoryRouter>
);

describe('Login page', () => {
  it('shows validation errors when submitted empty', async () => {
    useAuth.mockReturnValue({ login: jest.fn() });
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('logs in and navigates to the dashboard on success', async () => {
    const login = jest.fn().mockResolvedValue({ token: 't', user: { id: 1 } });
    useAuth.mockReturnValue({ login });

    renderLogin();

    fireEvent.input(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'password123',
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows a server error message when login fails', async () => {
    const login = jest.fn().mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    useAuth.mockReturnValue({ login });

    renderLogin();

    fireEvent.input(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
