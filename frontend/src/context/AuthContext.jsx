import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await authService.getMe();
          setUser(res.user);
        }
      } catch (error) {
        console.error("Token invalid or expired", error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      const { token, user: loggedInUser } = res;
      localStorage.setItem('token', token);
      setUser(loggedInUser);
      return res;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      setUser(res.user);
      return res;
    } catch (error) {
      console.error("Profile update failed", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
