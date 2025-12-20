import api from './api';

// src/api/settings.js
// This is a dummy API for demonstration purposes.
// In a real application, these would be actual API calls to a backend.

// --- Business Settings API (DUMMY DATA) ---
// TODO: Replace with actual API calls when backend endpoints are available.
let DUMMY_BUSINESS_SETTINGS = {
  businessName: 'Joyful Cargo Logistics',
  contactInfo: 'info@joyfulcargo.com | +1 (555) 123-4567',
  address: '123 Logistics Way, Suite 100, City, State, 12345',
  logoUrl: '/path/to/logo.png',
  currency: 'USD',
  timezone: 'America/New_York',
};

export const getBusinessSettings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_BUSINESS_SETTINGS);
    }, 300);
  });
};

export const updateBusinessSettings = async (updatedSettings) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      DUMMY_BUSINESS_SETTINGS = { ...DUMMY_BUSINESS_SETTINGS, ...updatedSettings };
      resolve(DUMMY_BUSINESS_SETTINGS);
    }, 500);
  });
};


// --- User Management API ---
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const resetUserPassword = async (id) => {
  // In a real app, this would ideally trigger a password reset email.
  // For now, we'll generate a random password and update the user.
  const newPassword = Math.random().toString(36).slice(-8);
  const response = await api.put(`/users/${id}`, { password: newPassword });
  // The backend doesn't return the new password, so we'll just return a success message.
  // We could also return the generated password to be displayed to the admin.
  return { ...response.data, newPassword };
};


// --- Dashboard API ---
export const getDashboardOverview = async () => {
  const response = await api.get('/dashboard/overview');
  return response.data;
};

export const getRevenueTrend = async () => {
  const response = await api.get('/dashboard/revenue-trend');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};
