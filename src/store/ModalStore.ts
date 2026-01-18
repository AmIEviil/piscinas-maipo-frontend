import { create } from "zustand";

interface ModalSlice {
  isModalOpen: boolean;
  headerContent: React.ReactNode | null;
  modalContent: React.ReactNode | null;
  openModal: (header: React.ReactNode | null, content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalSlice>((set) => ({
  isModalOpen: false,
  headerContent: null,
  modalContent: null,
  openModal: (header, content) =>
    set({ isModalOpen: true, headerContent: header, modalContent: content }),
  closeModal: () =>
    set({ isModalOpen: false, headerContent: null, modalContent: null }),
}));
