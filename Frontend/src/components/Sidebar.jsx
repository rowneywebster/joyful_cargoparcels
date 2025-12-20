import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css'; // Import Sidebar specific styles

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const isMobile = window.innerWidth <= 768; // Determine if on mobile

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' }, // Placeholder icon
    { name: 'Parcels', path: '/parcels', icon: '📦' },
    { name: 'Postponed Orders', path: '/postponed-orders', icon: '⏰' },
    { name: 'Expenses', path: '/expenses', icon: '💸', roles: ['admin'] }, // Admin only
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <>
      {isMobile && ( // Only show hamburger on mobile
        <button className="hamburger-menu" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Joyful Cargo</h1>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              // Render item only if user has the required role or no role is specified
              if (item.roles && user && !item.roles.includes(user.role)) {
                return null;
              }
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                    onClick={isMobile ? toggleSidebar : undefined} // Close sidebar on navigation only on mobile
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-name">{user?.name || 'Guest'}</span>
            <span className="user-role">({user?.role || 'N/A'})</span>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
