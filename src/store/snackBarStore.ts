import { create } from "zustand";

interface SnackBarSlice {
  open: boolean;
  message: string;
  setSnackBar: (open: boolean, message: string) => void;
}

export const useSnackBarModalStore = create<SnackBarSlice>((set) => ({
  open: false,
  message: "",
  setSnackBar: (open, message) => set({ open, message }),
}));

