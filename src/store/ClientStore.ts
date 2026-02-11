import { create, type StateCreator } from "zustand";
import { clientService } from "../core/services/ClientsService";
import type { Client } from "../service/client.interface";
import type { IClientForm } from "../components/client/InfoClient/clientInfoFields/ClientInfoFields";
import type { ResumenMonth } from "../components/client/InfoClient/resumeMaintenances/ResumeMaintenance";

interface ClientStore {
  clients: Client[];
  fetchClients: () => Promise<void>;
}
export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  fetchClients: async () => {
    const clients = await clientService.getClients();
    set({ clients });
  },
}));

export interface ClientFilterSlice {
  dayFilter: string;
  setDayFilter: (day: string) => void;
}

export const createClientFilterSlice: StateCreator<ClientFilterSlice> = (
  set,
) => ({
  dayFilter: "",
  setDayFilter: (day: string) => set({ dayFilter: day }),
});

interface ClientResumenMonthSlice {
  resumenMonth: ResumenMonth | null;
  clientInfo: IClientForm;
  isModalOpen: boolean;
  setClientInfo: (client: IClientForm) => void;
  openModal: () => void;
  closeModal: () => void;
  setResumenMonth: (resumen: ResumenMonth | null) => void;
}

export const useClientResumenMonthStore = create<ClientResumenMonthSlice>(
  (set) => ({
    resumenMonth: null,
    isModalOpen: false,
    clientInfo: {} as IClientForm,
    setClientInfo: (client: IClientForm) => set({ clientInfo: client }),
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
    setResumenMonth: (resumen: ResumenMonth | null) =>
      set({ resumenMonth: resumen }),
  }),
);
