import axios from "axios";
import { navigateTo } from "../../utils/NavigationUtils";
import { StorageUtils } from "../../utils/StorageUtils";
import { useBoundStore } from "../../store/BoundedStore";
import { useSnackBarResponseStore } from "../../store/snackBarStore";

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

    // Rol sin permiso para la ruta: se avisa pero se mantiene la sesion.
    // Fuera de React no hay hook, se usa el store directo con la misma
    // secuencia que useSnackbar para que el aviso se re-dispare.
    if (error.response?.status === 403) {
      const snackbar = useSnackBarResponseStore.getState();
      snackbar.setSnackbarVisible(false);
      setTimeout(() => {
        snackbar.setSnackbarMessage("No tienes permisos para esta acción");
        snackbar.setSnackbarType("error");
        snackbar.setSnackbarVisible(true);
      }, 10);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
