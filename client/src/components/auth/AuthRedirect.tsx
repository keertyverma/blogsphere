import LandingPage from "@/pages/LandingPage";
import { useAuthStore } from "@/store";
import { Navigate } from "react-router-dom";
import LandingLayout from "../layout/LandingLayout";

const AuthRedirect = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <LandingLayout>
      <LandingPage />
    </LandingLayout>
  );
};

export default AuthRedirect;
