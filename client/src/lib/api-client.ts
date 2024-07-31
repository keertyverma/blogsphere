import { useAuthStore } from "@/store";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_DOMAIN,
  withCredentials: true, // Ensure cookies are sent with the request
});

const useAxiosInterceptors = () => {
  const setTokenExpired = useAuthStore((state) => state.setTokenExpired);
  const clearUserAuth = useAuthStore((state) => state.clearUserAuth);
  const setRedirectedUrl = useAuthStore((state) => state.setRedirectedUrl);
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const {
            status,
            data: {
              error: { details },
            },
          } = error.response;

          if (status === 401 && details.includes("Token has expired")) {
            // this will reset user auth and re-direct user to login page
            setTokenExpired(true);
            clearUserAuth();

            setRedirectedUrl(location.pathname);
            navigate("/login");
            toast.error("Your session has expired. Please log in again.", {
              position: "top-right",
              className: "mt-20",
            });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, []);
};

export default apiClient;
export { useAxiosInterceptors };
