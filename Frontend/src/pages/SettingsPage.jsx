import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { useAuth } from '../hooks/useAuth';
import {
  getUsers, createUser, updateUser, deleteUser, updateUserRole
} from '../api/settings';

const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'profile');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      getUsers()
        .then(setUsers)
        .catch(err => {
          setError('Failed to fetch users data.');
          console.error('Error fetching users:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // If not admin, stop loading immediately
    }
  }, [isAdmin]);

  const handleAddEditUser = async (userData) => {
    setError(null);
    try {
      if (currentUser) {
        await updateUser(currentUser.id, userData);
      } else {
        await createUser(userData);
      }
      setIsUserModalOpen(false);
      setCurrentUser(null);
      const allUsers = await getUsers();
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
        const allUsers = await getUsers();
        setUsers(allUsers);
      } catch (err) {
        setError('Failed to delete user.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setError(null);
    try {
      await updateUserRole(userId, newRole);
      const allUsers = await getUsers();
      setUsers(allUsers);
    } catch (err) {
      setError('Failed to update user role.');
      console.error('Error updating role:', err);
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
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        )}
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Personal Profile
        </button>
      </div>

      <div className="settings-content">
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button className="action-button edit" onClick={() => openEditUserModal(u)}>Edit</button>
                        <button className="action-button delete" onClick={() => handleDeleteUser(u.id)}>Delete</button>
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
                <input type="text" id="profileName" value={user?.username || ''} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="profileEmail">Email</label>
                <input type="email" id="profileEmail" value={user?.email || ''} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="profileRole">Role</label>
                <input type="text" id="profileRole" value={user?.role || ''} readOnly />
              </div>
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

const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});


  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'user',
        password: '',
      });
    } else {
      setFormData(
        { username: '', email: '', role: 'user', password: '' }
      );
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!user && !formData.password) errors.password = 'Password is required for new users';
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
            <label htmlFor="username">Name *</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
            {formErrors.username && <p className="form-error">{formErrors.username}</p>}
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
          {!user && (
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
