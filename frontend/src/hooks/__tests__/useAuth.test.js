import React from 'react';
import { renderHook } from '@testing-library/react';
import useAuth from '../useAuth';
import { AuthContext } from '../../context/AuthContext';

describe('useAuth', () => {
  it('throws when used outside of an AuthProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useAuth();
      } catch (error) {
        return error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect(result.current.message).toBe('useAuth must be used within an AuthProvider');
  });

  it('returns the context value when rendered within an AuthProvider', () => {
    const contextValue = { user: { id: 1, name: 'Jane' }, loading: false };
    const wrapper = ({ children }) => (
      <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(contextValue);
  });
});
