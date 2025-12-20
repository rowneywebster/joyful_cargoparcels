import axios from 'axios';
import { refreshToken } from './auth';

const api = axios.create({
  baseURL: 'http://lkok8cs0co0w8o4oos800s4g.161.97.125.199.sslip.io/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newTokens = await refreshToken();
        localStorage.setItem('access_token', newTokens.access_token);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newTokens.access_token;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login)
        console.error('Unable to refresh token', refreshError);
        // Here you might want to redirect to login page
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
