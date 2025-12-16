import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../components/ForgotPasswordModal'; // Import the new modal
import './LoginPage.css'; // Import the CSS file

const LoginPage = () => {
  const [username, setUsername] = useState('admin'); // Pre-fill for testing
  const [password, setPassword] = useState('password'); // Pre-fill for testing
  const [error, setError] = useState('');
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null; // Or a loading spinner
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    const result = await login({ username, password });
    if (!result.success) {
      setError(result.message);
    }
    // Redirection is handled by AuthContext on successful login
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2 className="login-title">Joyful Cargo Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
          <div className="forgot-password-link">
            <a href="#" onClick={() => setIsForgotPasswordModalOpen(true)}>Forgot Password?</a>
          </div>
        </form>
      </div>

      {isForgotPasswordModalOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} />
      )}
    </div>
  );
};

export default LoginPage;
