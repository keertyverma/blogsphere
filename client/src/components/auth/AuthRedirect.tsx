import LandingPage from "@/pages/LandingPage";
import { useAuthStore } from "@/store";
import { Navigate } from "react-router-dom";

const AuthRedirect = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/feed" /> : <LandingPage />;
};

export default AuthRedirect;
