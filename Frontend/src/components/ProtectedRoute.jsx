import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>; // Or a proper loading spinner component
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not have the required role
    // Redirect to an unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />; // You might want to create an UnauthorizedPage
  }

  // User is authenticated and has the allowed role (if specified), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
