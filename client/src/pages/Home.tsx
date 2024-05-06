import { useAuthContext } from "@/context/authContext";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Home Page</div>;
};

export default Home;
