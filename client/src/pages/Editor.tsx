import { useAuthContext } from "@/context/AuthProvider";
import { Navigate } from "react-router-dom";

const Editor = () => {
  const { isAuthenticated } = useAuthContext();

  return !isAuthenticated ? <Navigate to="/login" /> : <div>Editor Page</div>;
};

export default Editor;
