import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_DOMAIN,
  withCredentials: true, // Ensure cookies are sent with the request
});

export default apiClient;
