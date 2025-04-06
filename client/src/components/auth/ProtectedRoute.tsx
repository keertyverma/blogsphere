import { useAuthStore } from "@/store";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
