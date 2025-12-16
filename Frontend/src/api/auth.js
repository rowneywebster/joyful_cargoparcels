// src/api/auth.js
// This is a dummy API for demonstration purposes.
// In a real application, these would be actual API calls to a backend.

const DUMMY_USERS = [
  { username: 'admin', password: 'password', role: 'admin', name: 'Admin User' },
  { username: 'user', password: 'password', role: 'user', name: 'Regular User' },
];

export const login = async ({ username, password }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = DUMMY_USERS.find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        const accessToken = `dummy-jwt-access-token-${user.username}-${Date.now()}`;
        const refreshToken = `dummy-jwt-refresh-token-${user.username}-${Date.now()}`;
        const expiresIn = 3600; // 1 hour in seconds

        resolve({
          success: true,
          user: { username: user.username, role: user.role, name: user.name },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
        });
      } else {
        resolve({ success: false, message: 'Invalid username or password' });
      }
    }, 1000); // Simulate network delay
  });
};

export const logout = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you might invalidate the token on the server side
      resolve({ success: true, message: 'Logged out successfully' });
    }, 500); // Simulate network delay
  });
};

export const refreshToken = async (oldRefreshToken) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app, this would validate the old refresh token with the backend
      // and issue a new access token and refresh token.
      if (oldRefreshToken && oldRefreshToken.startsWith('dummy-jwt-refresh-token-')) {
        const username = oldRefreshToken.split('-')[3];
        const user = DUMMY_USERS.find(u => u.username === username);
        if (user) {
          const newAccessToken = `dummy-jwt-access-token-${user.username}-${Date.now()}`;
          const newRefreshToken = `dummy-jwt-refresh-token-${user.username}-${Date.now()}`;
          const expiresIn = 3600; // 1 hour in seconds
          resolve({
            success: true,
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_in: expiresIn,
          });
        } else {
          reject({ success: false, message: 'Invalid refresh token' });
        }
      } else {
        reject({ success: false, message: 'Invalid refresh token' });
      }
    }, 500);
  });
};

export const forgotPassword = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would send a password reset email
      console.log(`Simulating password reset for: ${email}`);
      if (email.includes('@')) {
        resolve({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
      } else {
        resolve({ success: false, message: 'Please enter a valid email address.' });
      }
    }, 1000);
  });
};
