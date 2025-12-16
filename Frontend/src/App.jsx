import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Import the new DashboardPage
import ParcelsPage from './pages/ParcelsPage'; // Import ParcelsPage
import PostponedOrdersPage from './pages/PostponedOrdersPage'; // Import PostponedOrdersPage
import ExpensesPage from './pages/ExpensesPage'; // Import ExpensesPage
import SettingsPage from './pages/SettingsPage'; // Import SettingsPage
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout'; // Import MainLayout
import { useAuth } from './hooks/useAuth';

// Dummy Unauthorized Component
const UnauthorizedPage = () => {
  return (
    <div style={{ padding: '20px', color: '#ef4444' }}>
      <h1>403 - Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );
};

function App() {
  const { loading, isAuthenticated } = useAuth(); // Get loading and isAuthenticated state

  if (loading) {
    return <div style={{ fontSize: '30px', color: 'blue', textAlign: 'center', marginTop: '50px' }}>Loading application...</div>; // Show a global loading indicator
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes using MainLayout */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'user']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Admin-only Protected Route Example within MainLayout */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin-settings" element={<div>Admin Settings Page</div>} />
            </Route>
            {/* Add other protected routes here */}
            <Route path="/parcels" element={<ParcelsPage />} />
            <Route path="/postponed-orders" element={<PostponedOrdersPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Redirect any unmatched routes */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
