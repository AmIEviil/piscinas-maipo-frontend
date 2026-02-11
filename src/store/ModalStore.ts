import { create } from "zustand";

interface ModalSlice {
  isModalOpen: boolean;
  headerContent: React.ReactNode | null;
  modalContent: React.ReactNode | null;
  footerContent: React.ReactNode | null;
  dialogClassName?: string;
  openModal: ({
    header,
    content,
    footer,
    dialogClassName,
  }: {
    header: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    dialogClassName?: string;
  }) => void;
  onAccept?: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalSlice>((set) => ({
  isModalOpen: false,
  headerContent: null,
  modalContent: null,
  footerContent: null,
  dialogClassName: "",
  openModal: ({
    header,
    content,
    footer,
    dialogClassName,
  }: {
    header: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    dialogClassName?: string;
  }) =>
    set({
      headerContent: header,
      modalContent: content,
      footerContent: footer || null,
      dialogClassName: dialogClassName || "",
      isModalOpen: true,
    }),
  onAccept: undefined,
  closeModal: () =>
    set({
      isModalOpen: false,
      headerContent: null,
      modalContent: null,
      footerContent: null,
      dialogClassName: "",
    }),
}));
