import { create } from "zustand";

interface SolicitudProductosState {
  isModalOpen: boolean;
  typeProduct: string;
  setTypeProduct: (type: string) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useSolicitudProductosStore = create<SolicitudProductosState>(
  (set) => ({
    isModalOpen: false,
    typeProduct: "",
    setTypeProduct: (type) => set({ typeProduct: type }),
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
  })
);
