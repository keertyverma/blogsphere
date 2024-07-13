import { IUser } from "@/types";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: IUser;
  isAuthenticated: boolean;
  setUserAuth: (user: IUser) => void;
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
      isAuthenticated: false,
      setUserAuth: (user) => set({ user, isAuthenticated: !!user.id }),
      clearUserAuth: () => set({ user: initialUser, isAuthenticated: false }),
    }),
    {
      name: "BlogsphereAuthStore",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { user } = state;
          state.isAuthenticated = !!user.id;
        }
      },
    }
  )
);

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Auth Store", useAuthStore);
}
