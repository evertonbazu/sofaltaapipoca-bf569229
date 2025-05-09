
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  admin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  admin = false
}) => {
  const { authState, isAdmin } = useAuth();

  // Show loading state while checking authentication
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!authState.user) {
    return <Navigate to="/auth" replace />;
  }

  // If admin only and user is not admin, redirect to home
  if (admin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Render children if all conditions pass
  return <>{children}</>;
};

export default ProtectedRoute;
