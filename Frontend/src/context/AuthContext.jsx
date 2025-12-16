import { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefreshToken } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check if access token is expired
  const isAccessTokenExpired = (expiresAt) => {
    if (!expiresAt) return true;
    return Date.now() > expiresAt;
  };

  // Function to attempt token refresh
  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) {
      console.log('No refresh token found, logging out.');
      logout();
      return false;
    }

    try {
      const response = await apiRefreshToken(storedRefreshToken);
      if (response.success) {
        const newExpiresAt = Date.now() + response.expires_in * 1000;
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('expires_at', newExpiresAt);
        return true;
      } else {
        console.error('Failed to refresh token:', response.message);
        logout();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedAccessToken = localStorage.getItem('access_token');
      const storedExpiresAt = localStorage.getItem('expires_at');

      if (storedUser && storedAccessToken && storedExpiresAt) {
        const parsedUser = JSON.parse(storedUser);
        const expiresAt = Number(storedExpiresAt);

        if (isAccessTokenExpired(expiresAt)) {
          console.log('Access token expired, attempting refresh...');
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Refresh failed, user is logged out by refreshAccessToken
          }
        } else {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await apiLogin(credentials);
      if (response.success) {
        const userData = response.user;
        const expiresAt = Date.now() + response.expires_in * 1000; // Calculate expiry time

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('expires_at', expiresAt);
        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshAccessToken, // Expose refresh function if needed elsewhere
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
