import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireVerified = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireVerified && !user.email_verified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }
  return children;
}
