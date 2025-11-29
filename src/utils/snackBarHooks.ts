import { useSnackBarResponseStore } from "../store/snackBarStore";

export const useSnackbar = () => {
  const setSnackbarMessage = useSnackBarResponseStore(
    (state) => state.setSnackbarMessage
  );
  const setSnackbarType = useSnackBarResponseStore(
    (state) => state.setSnackbarType
  );
  const setSnackbarVisible = useSnackBarResponseStore(
    (state) => state.setSnackbarVisible
  );

  return {
    showSnackbar: (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info"
    ) => {
      setSnackbarVisible(false);
      setTimeout(() => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
      }, 10);
    },
  };
};
