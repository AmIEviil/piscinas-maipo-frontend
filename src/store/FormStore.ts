import { type StateCreator } from "zustand";

export interface FormStoreSlice {
  isEditingField: boolean;
  setIsEditingField: (isEditing: boolean) => void;
}

export const createFormSlice: StateCreator<FormStoreSlice> = (set) => ({
  isEditingField: false,
  setIsEditingField: (isEditing: boolean) => set({ isEditingField: isEditing }),
});
