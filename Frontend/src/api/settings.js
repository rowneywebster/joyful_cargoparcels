// src/api/settings.js
// This is a dummy API for demonstration purposes.
// In a real application, these would be actual API calls to a backend.

let DUMMY_BUSINESS_SETTINGS = {
  businessName: 'Joyful Cargo Logistics',
  contactInfo: 'info@joyfulcargo.com | +1 (555) 123-4567',
  address: '123 Logistics Way, Suite 100, City, State, 12345',
  logoUrl: '/path/to/logo.png',
  currency: 'USD',
  timezone: 'America/New_York',
};

let DUMMY_USERS = [
  { id: 'USR001', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
  { id: 'USR002', name: 'Regular User', email: 'user@example.com', role: 'user', status: 'active' },
  { id: 'USR003', name: 'Inactive User', email: 'inactive@example.com', role: 'user', status: 'inactive' },
];

// --- Business Settings API ---
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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_USERS);
    }, 500);
  });
};

export const getUserById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = DUMMY_USERS.find((u) => u.id === id);
      if (user) {
        resolve(user);
      } else {
        throw new Error('User not found');
      }
    }, 300);
  });
};

export const addUser = async (newUser) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `USR${String(DUMMY_USERS.length + 1).padStart(3, '0')}`;
      const userWithId = { ...newUser, id, status: newUser.status || 'active' };
      DUMMY_USERS.push(userWithId);
      resolve(userWithId);
    }, 500);
  });
};

export const updateUser = async (id, updatedUser) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = DUMMY_USERS.findIndex((u) => u.id === id);
      if (index !== -1) {
        DUMMY_USERS[index] = { ...DUMMY_USERS[index], ...updatedUser };
        resolve(DUMMY_USERS[index]);
      } else {
        throw new Error('User not found');
      }
    }, 500);
  });
};

export const deleteUser = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = DUMMY_USERS.length;
      DUMMY_USERS = DUMMY_USERS.filter((u) => u.id !== id);
      if (DUMMY_USERS.length < initialLength) {
        resolve({ success: true });
      } else {
        throw new Error('User not found');
      }
    }, 500);
  });
};

export const resetUserPassword = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = DUMMY_USERS.find((u) => u.id === id);
      if (user) {
        // In a real app, this would send a reset link or set a temporary password
        console.log(`Password for user ${user.name} (ID: ${id}) has been reset.`);
        resolve({ success: true, message: 'Password reset initiated.' });
      } else {
        throw new Error('User not found');
      }
    }, 500);
  });
};
