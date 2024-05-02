import { useAuthContext } from "@/context/AuthProvider";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuthContext();

  return !isAuthenticated ? <Navigate to="/login" /> : <div>Home Page</div>;
};

export default Home;
