import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import useAuth from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth');

const renderProtectedRoute = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  it('shows a loading spinner while auth state is resolving', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    const { container } = renderProtectedRoute();

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
  });

  it('renders the protected content when a user is authenticated', () => {
    useAuth.mockReturnValue({ user: { id: 1, name: 'Jane' }, loading: false });

    renderProtectedRoute();

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('redirects to /login when there is no authenticated user', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderProtectedRoute();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
  });
});
