import { IUser } from "@/types";
import { createContext } from "react";

type AuthContextType = {
  user: IUser;
  token: string;
  setUserAndToken: (user: IUser, token: string) => void;
};

const authContext = createContext<AuthContextType>({} as AuthContextType);

export default authContext;
