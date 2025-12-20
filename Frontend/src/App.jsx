import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ParcelsPage from './pages/ParcelsPage';
import PostponedOrdersPage from './pages/PostponedOrdersPage';
import ExpensesPage from './pages/ExpensesPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

const UnauthorizedPage = () => {
  return (
    <div style={{ padding: '20px', color: '#ef4444' }}>
      <h1>403 - Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );
};

function App() {
  const { loading, isAuthenticated, hasError } = useAuth();

  if (loading) {
    return <div style={{ fontSize: '30px', color: 'blue', textAlign: 'center', marginTop: '50px' }}>Loading application...</div>;
  }

  if (hasError) {
    return (
      <div style={{
        fontSize: '20px',
        color: 'red',
        textAlign: 'center',
        marginTop: '50px',
        padding: '20px',
        border: '1px solid red',
        backgroundColor: '#ffebeb'
      }}>
        <p>An error occurred during application initialization or API communication.</p>
        <p>Please check your network connection and ensure the backend server is running and accessible.</p>
        <p>If the problem persists, please contact support.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="parcels" element={<ParcelsPage />} />
          <Route path="postponed-orders" element={<PostponedOrdersPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="admin-settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Settings Page</div>
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;