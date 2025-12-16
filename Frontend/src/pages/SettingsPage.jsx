import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { useAuth } from '../hooks/useAuth';
import {
  getBusinessSettings, updateBusinessSettings,
  getUsers, addUser, updateUser, deleteUser, resetUserPassword
} from '../api/settings';

const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [businessSettings, setBusinessSettings] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'business' : 'profile'); // Admin default to business, user to profile

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // For edit user

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const bs = await getBusinessSettings();
          setBusinessSettings(bs);
          const allUsers = await getUsers();
          setUsers(allUsers);
        } else {
          // For regular users, fetch their own profile data if needed
          // For now, we'll just use the user from auth context
        }
      } catch (err) {
        setError('Failed to fetch settings data.');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const handleUpdateBusinessSettings = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await updateBusinessSettings(businessSettings);
      alert('Business settings updated successfully!');
    } catch (err) {
      setError('Failed to update business settings.');
      console.error('Error updating business settings:', err);
    }
  };

  const handleAddEditUser = async (userData) => {
    setError(null);
    try {
      if (currentUser) {
        await updateUser(currentUser.id, userData);
      } else {
        await addUser(userData);
      }
      setIsUserModalOpen(false);
      setCurrentUser(null);
      const allUsers = await getUsers(); // Refresh user list
      setUsers(allUsers);
    } catch (err) {
      setError('Failed to save user.');
      console.error('Error saving user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setError(null);
      try {
        await deleteUser(userId);
        const allUsers = await getUsers(); // Refresh user list
        setUsers(allUsers);
      } catch (err) {
        setError('Failed to delete user.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      setError(null);
      try {
        await resetUserPassword(userId);
        alert('User password reset successfully!');
      } catch (err) {
        setError('Failed to reset password.');
        console.error('Error resetting password:', err);
      }
    }
  };

  const openAddUserModal = () => {
    setCurrentUser(null);
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (userToEdit) => {
    setCurrentUser(userToEdit);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setCurrentUser(null);
  };

  if (loading) {
    return <div className="loading-message">Loading settings...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="settings-page-container">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-tabs">
        {isAdmin && (
          <>
            <button
              className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              Business Settings
            </button>
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
          </>
        )}
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Personal Profile
        </button>
      </div>

      <div className="settings-content">
        {isAdmin && activeTab === 'business' && (
          <div className="settings-section">
            <h2>Business Settings</h2>
            <form onSubmit={handleUpdateBusinessSettings}>
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  value={businessSettings.businessName || ''}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactInfo">Contact Information</label>
                <input
                  type="text"
                  id="contactInfo"
                  value={businessSettings.contactInfo || ''}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, contactInfo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  value={businessSettings.address || ''}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="primary-button">Save Business Settings</button>
            </form>
          </div>
        )}

        {isAdmin && activeTab === 'users' && (
          <div className="settings-section">
            <h2>User Management</h2>
            <button className="primary-button add-user-button" onClick={openAddUserModal}>Add New User</button>
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.status}</td>
                      <td>
                        <button className="action-button edit" onClick={() => openEditUserModal(u)}>Edit</button>
                        <button className="action-button delete" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        <button className="action-button reset-password" onClick={() => handleResetPassword(u.id)}>Reset Password</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="settings-section">
            <h2>Personal Profile</h2>
            <form>
              <div className="form-group">
                <label htmlFor="profileName">Name</label>
                <input type="text" id="profileName" value={user?.name || ''} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="profileEmail">Email</label>
                <input type="email" id="profileEmail" value={user?.username || ''} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="profileRole">Role</label>
                <input type="text" id="profileRole" value={user?.role || ''} readOnly />
              </div>
              {/* Add password change and notification preferences here */}
              <button type="submit" className="primary-button" disabled>Update Profile (Coming Soon)</button>
            </form>
          </div>
        )}
      </div>

      {isUserModalOpen && (
        <UserModal
          user={currentUser}
          onClose={closeUserModal}
          onSave={handleAddEditUser}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: '', // Only for new user
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        password: '', // Never pre-fill password for edit
      });
    } else {
      setFormData(
        { name: '', email: '', role: 'user', status: 'active', password: '' }
      );
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!user && !formData.password) errors.password = 'Password is required for new users'; // Password required only for new users
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            {formErrors.name && <p className="form-error">{formErrors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            {formErrors.email && <p className="form-error">{formErrors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {!user && ( // Password field only for new users
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
              {formErrors.password && <p className="form-error">{formErrors.password}</p>}
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
