import { create } from "zustand";

interface CustomSnackBarSlice {
  open: boolean;
  message: string;
  setSnackBar: (open: boolean, message: string) => void;
}

export const useSnackBarModalStore = create<CustomSnackBarSlice>((set) => ({
  open: false,
  message: "",
  setSnackBar: (open, message) => set({ open, message }),
}));

export interface SnackBarSlice {
  snackbarMessage: string;
  snackbarType: "success" | "error" | "warning" | "info";
  snackbarDuration: number;
  snackbarVisible: boolean;
  setSnackbarMessage: (message: string) => void;
  setSnackbarType: (type: "success" | "error" | "warning" | "info") => void;
  setSnackbarDuration: (duration: number) => void;
  setSnackbarVisible: (visible: boolean) => void;
}
export const useSnackBarResponseStore = create<SnackBarSlice>((set) => ({
  snackbarMessage: "Soy un SnackBar",
  snackbarType: "info",
  snackbarDuration: 10000,
  snackbarVisible: false,
  setSnackbarMessage: (message) => set({ snackbarMessage: message }),
  setSnackbarType: (type) => set({ snackbarType: type }),
  setSnackbarDuration: (duration) => set({ snackbarDuration: duration }),
  setSnackbarVisible: (visible) => set({ snackbarVisible: visible }),
}));
