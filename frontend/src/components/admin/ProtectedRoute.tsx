
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'viewer' }) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  // Add debugging
  console.log('ProtectedRoute:', {
    path: location.pathname,
    requiredRole,
    user: user ? {
      id: user.id,
      username: user.username,
      role: user.role
    } : null,
    hasPermission: user ? hasPermission(requiredRole) : false
  });

  if (loading) {
    console.log('ProtectedRoute: Loading...');
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    if (location.pathname.startsWith('/admin')) {
      toast.error("Please login to access this page");
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Always allow access to dashboard for any authenticated user
  if (location.pathname === '/admin/dashboard') {
    console.log('ProtectedRoute: Dashboard access granted');
    return <>{children}</>;
  }

  // Check permissions
  if (!hasPermission(requiredRole)) {
    console.log('ProtectedRoute: Permission denied', { userRole: user.role, requiredRole });
    toast.error(`You don't have permission to access this page. Required role: ${requiredRole}, Your role: ${user.role}`);
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;





