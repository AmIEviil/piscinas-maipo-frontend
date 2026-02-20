import axios from "axios";
import { navigateTo } from "../../utils/NavigationUtils";
import { StorageUtils } from "../../utils/StorageUtils";
import { useBoundStore } from "../../store/BoundedStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const store = useBoundStore.getState();
    const logOutUser = store.logOutUser;

    if (error.response?.status === 401) {
      StorageUtils.clearAllStorage();
      localStorage.removeItem("token");
      logOutUser();
      navigateTo("/login");
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
