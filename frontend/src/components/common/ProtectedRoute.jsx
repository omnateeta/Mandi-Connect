import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  
  // Check if token exists in localStorage
  const hasToken = !!localStorage.getItem('token');

  // Show loading while checking auth (only if we have a token but user data is loading)
  if (isLoading && hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-500"></div>
      </div>
    );
  }

  // Not authenticated (no token and not authenticated)
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'farmer') {
      return <Navigate to="/farmer/dashboard" replace />;
    } else if (user?.role === 'retailer') {
      return <Navigate to="/retailer/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
