import { Navigate } from "react-router";
import { useMockAuth } from "./AuthProvider";

function ProtectedRoute({ children }) {
  const { activeUser } = useMockAuth();

  if (!activeUser) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default ProtectedRoute;
