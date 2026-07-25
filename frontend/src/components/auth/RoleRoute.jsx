import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const RoleRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in but wrong role, redirect to appropriate dashboard
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return children;
};

export default RoleRoute;
