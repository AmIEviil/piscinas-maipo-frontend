import { create } from "zustand";

export interface pdfData {
  id?: number;
  title: string;
  url: string;
  revisado?: boolean;
}

interface pdfStore {
  pdfData: pdfData;
  setPdfData: (pdfData: pdfData) => Promise<void>;
}
export const usePdfStore = create<pdfStore>((set) => ({
  pdfData: {
    id: undefined,
    title: "",
    url: "",
    revisado: false,
  },
  setPdfData: async (pdfData: pdfData) => {
    set({ pdfData });
  },
}));
