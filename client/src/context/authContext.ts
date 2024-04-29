import { IUser } from "@/types";
import { createContext } from "react";

type AuthContextType = {
  user: IUser;
  token: string;
  setUserAndToken: (user: IUser, token: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

const authContext = createContext<AuthContextType>({} as AuthContextType);

export default authContext;
