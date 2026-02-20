import { create } from "zustand";

interface ModalSlice {
  isModalOpen: boolean;
  headerContent: React.ReactNode | null;
  modalContent: React.ReactNode | null;
  footerContent: React.ReactNode | null;
  dialogClassName?: string;
  bodyClassName?: string;
  openModal: ({
    header,
    content,
    footer,
    dialogClassName,
    bodyClassName,
  }: {
    header?: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    dialogClassName?: string;
    bodyClassName?: string;
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
  bodyClassName: "",
  openModal: ({
    header,
    content,
    footer,
    dialogClassName,
    bodyClassName,
  }: {
    header?: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    dialogClassName?: string;
    bodyClassName?: string;
  }) =>
    set({
      isModalOpen: true,
      headerContent: header,
      modalContent: content,
      footerContent: footer || null,
      dialogClassName: dialogClassName || "",
      bodyClassName: bodyClassName || "",
    }),
  onAccept: undefined,
  closeModal: () =>
    set({
      isModalOpen: false,
      headerContent: null,
      modalContent: null,
      footerContent: null,
      dialogClassName: "",
      bodyClassName: "",
    }),
}));
