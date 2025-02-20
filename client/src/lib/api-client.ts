import { useAuthStore } from "@/store";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearBlogReadTimestamps, showErrorToast } from "./utils";

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
          const { status } = error.response;
          if (status === 401) {
            // Handle unauthorized access due to token expiration or missing token
            setTokenExpired(true);
            clearUserAuth();
            clearBlogReadTimestamps(); // clear blog read tracking timestamp

            // Save the current URL to redirect the user after login
            setRedirectedUrl(`${location.pathname}${location.search || ""}`);
            navigate("/login");

            showErrorToast("Your session has expired. Please log in again.");
          }

          if (status === 429) {
            // Api rate limit exceeds
            showErrorToast(
              "You have exceeded the request limit. Please try again later in 1 hour."
            );
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
