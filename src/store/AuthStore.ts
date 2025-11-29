import { type StateCreator } from "zustand";
import type { LoginResponse } from "../core/models/login/LoginResponse";
import { StorageUtils } from "../utils/StorageUtils";

export interface LoginSlice {
  userData: LoginResponse | undefined;
  token: string | undefined;
  setUserData: (userData: LoginResponse | undefined) => void;
  setToken: (token: string) => void;
  logOutUser: () => void;
}

export const createLoginSlice: StateCreator<LoginSlice> = (set) => ({
  userData: undefined,
  token: undefined,
  setUserData: (userData) => set({ userData }),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  logOutUser: () => {
    set(() => ({ token: undefined }));
    set(() => ({ userData: undefined }));
    StorageUtils.clearAllStorage();
  },
});

export interface RecoverPassSlice {
  email: string | undefined;
  addEmail: (email: string) => void;
}

export const useRecoverPassStore: StateCreator<RecoverPassSlice> = (set) => ({
  email: "",
  addEmail: (email: string) => set(() => ({ email: email })),
});

export interface ConfigEmailStoreSlice {
  user_id: string | undefined;
  setUserId: (userId: string | undefined) => void;
  resetUserId: () => void;
}

export const useConfigEmailStore: StateCreator<ConfigEmailStoreSlice> = (
  set
) => ({
  user_id: undefined,
  setUserId: (userId: string | undefined) => set({ user_id: userId }),
  resetUserId: () => set({ user_id: undefined }),
});

export interface RecoverStoreSlice {
  message: string | null | undefined;
  setMessage: (message: string | null) => void;
  clearMessage: () => void;
}

export const useRecoverStore: StateCreator<RecoverStoreSlice> = (set) => ({
  message: null,
  setMessage: (message: string | null) => set({ message }),
  clearMessage: () => set({ message: null }),
});

export interface ShowErrorBoxSlice {
  showErrorBox: boolean;
  setShowErrorBox: (show: boolean) => void;
  resetShowErrorBox: () => void;
  messageErrorBox: string;
  setMessageErrorBox: (message: string) => void;
  clearMessageErrorBox: () => void;
  remainingAttemps: number;
  setRemainingAttemps: (remaining: number) => void;
  clearRemainingAttemps: () => void;
  blockedUntil: Date | undefined;
  setBlockedUntil: (blockedUntil: Date | undefined) => void;
  clearBlockedUntil: () => void;
}

export const useShowErrorBoxStore: StateCreator<ShowErrorBoxSlice> = (set) => ({
  showErrorBox: false,
  setShowErrorBox: (show) => set({ showErrorBox: show }),
  resetShowErrorBox: () => set({ showErrorBox: false }),
  messageErrorBox: "",
  setMessageErrorBox: (message) => set({ messageErrorBox: message }),
  clearMessageErrorBox: () => set({ messageErrorBox: undefined }),
  remainingAttemps: 5,
  setRemainingAttemps: (remaining) => set({ remainingAttemps: remaining }),
  clearRemainingAttemps: () => set({ remainingAttemps: 5 }),
  blockedUntil: undefined,
  setBlockedUntil: (blockedUntil) => set({ blockedUntil }),
  clearBlockedUntil: () => set({ blockedUntil: undefined }),
});
