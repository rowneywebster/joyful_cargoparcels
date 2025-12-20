import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const userData = await getMe();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to fetch user data', error);
          localStorage.removeItem('access_token');
          setHasError(true); // Set error state
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setHasError(false); // Clear error on new login attempt
    try {
      const response = await apiLogin(credentials);
      localStorage.setItem('access_token', response.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
      const userData = await getMe();
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
    setHasError(false); // Clear error on logout
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    hasError, // Expose hasError
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};