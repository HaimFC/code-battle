import { Navigate, useLocation } from "react-router";
import { useAuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // while auth state is loading, don't redirect yet
  if (loading) return null; // or a spinner/skeleton

  if (!user) {
    // keep where the user wanted to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
