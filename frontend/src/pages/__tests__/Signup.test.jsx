import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../Signup';
import authService from '../../services/auth.service';

jest.mock('../../services/auth.service');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderSignup = () => render(
  <MemoryRouter>
    <Signup />
  </MemoryRouter>
);

describe('Signup page', () => {
  it('shows validation errors when submitted empty', async () => {
    renderSignup();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows a password length validation error', async () => {
    renderSignup();

    fireEvent.input(screen.getByLabelText(/full name/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('registers and navigates to /login with a success message', async () => {
    authService.register.mockResolvedValue({ user: { id: 1 } });

    renderSignup();

    fireEvent.input(screen.getByLabelText(/full name/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(authService.register).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { message: 'Registration successful! Please login.' },
    });
  });

  it('shows a server error message when registration fails', async () => {
    authService.register.mockRejectedValue({ response: { data: { message: 'Email already in use' } } });

    renderSignup();

    fireEvent.input(screen.getByLabelText(/full name/i), { target: { value: 'Jane' } });
    fireEvent.input(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
