import { IUser } from "@/types";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: IUser;
  isAuthenticated: boolean;
  isTokenExpired: boolean;
  redirectedUrl: string | null;
  setUserAuth: (user: IUser) => void;
  clearUserAuth: () => void;
  setTokenExpired: (expired: boolean) => void;
  setRedirectedUrl: (url: string) => void;
  clearRedirectedUrl: () => void;
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
      isTokenExpired: false,
      redirectedUrl: null,
      setUserAuth: (user) =>
        set({ user, isAuthenticated: !!user.id, isTokenExpired: false }),
      clearUserAuth: () => set({ user: initialUser, isAuthenticated: false }),
      setTokenExpired: (expired) => set({ isTokenExpired: expired }),
      setRedirectedUrl: (url) => set({ redirectedUrl: url }),
      clearRedirectedUrl: () => set({ redirectedUrl: null }),
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
