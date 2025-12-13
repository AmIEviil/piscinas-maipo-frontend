import { create } from "zustand";

interface RefetchSlice {
  shouldRefetch: boolean;
  setShouldRefetch: (value: boolean) => void;
}

export const useRefetchStore = create<RefetchSlice>((set) => ({
  shouldRefetch: false,
  setShouldRefetch: (value) => set({ shouldRefetch: value }),
}));
