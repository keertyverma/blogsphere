import { ReactNode, useContext, useEffect, useState } from "react";
import authContext from "./authContext";
import { IUser } from "@/types";
import { useNavigate } from "react-router-dom";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser>({
    id: "",
    email: "",
    username: "",
    fullname: "",
  });
  const [token, setToken] = useState<string>("");
  const navigate = useNavigate();

  const setUserAndToken = (user: IUser, token: string) => {
    localStorage.setItem("blogsphere_user", JSON.stringify({ user, token }));

    setUser({ ...user });
    setToken(token);
  };

  useEffect(() => {
    // check if user exists in local storage
    const loggedInUser = localStorage.getItem("blogsphere_user");
    if (loggedInUser) {
      const { user, token } = JSON.parse(loggedInUser);
      setUserAndToken(user, token);
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <authContext.Provider value={{ user, token, setUserAndToken }}>
      {children}
    </authContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("'useAuthContext' must be within a 'AuthProvider'");
  }

  return context;
};

export default AuthProvider;
export { useAuthContext };
