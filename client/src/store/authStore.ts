import { IUser } from "@/types";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: IUser;
  token: string;
  isAuthenticated: boolean;
  setUserAuth: (user: IUser, token: string) => void;
  clearUserAuth: () => void;
}

const initialUser = {
  id: "",
  email: "",
  username: "",
  fullname: "",
  profileImage: "",
};

// persist state in localStorage by default
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: initialUser,
      token: "",
      isAuthenticated: false,
      setUserAuth: (user, token) =>
        set({ user, token, isAuthenticated: !!user.id && !!token }),
      clearUserAuth: () =>
        set({ user: initialUser, token: "", isAuthenticated: false }),
    }),
    {
      name: "BlogsphereAuthStore",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { user, token } = state;
          state.isAuthenticated = !!user.id && !!token;
        }
      },
    }
  )
);

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Auth Store", useAuthStore);
}
