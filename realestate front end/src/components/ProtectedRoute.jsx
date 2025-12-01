import useAuthContext from "hooks/useAuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allow = [] }) => {
  const { user, loading } = useAuthContext();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  if (!allow || allow.length === 0) return children;

  if (allow.includes(user.role)) return children;

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
