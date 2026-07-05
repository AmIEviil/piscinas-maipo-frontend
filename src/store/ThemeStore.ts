import { type StateCreator } from "zustand";

export type ThemeMode = "light" | "dark";

export interface ThemeSlice {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set, get) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
});
