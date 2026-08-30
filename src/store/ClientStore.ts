import { create, type StateCreator } from "zustand";
import { clientService } from "../core/services/ClientsService";
import type { Client } from "../service/client.interface";
import type {
  IClientForm,
  ResumenMonth,
} from "../components/client/InfoClient/types";

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
  /**
   * Pide a BodyClients que marque todos los clientes del listado apenas
   * termine de cargar. Lo enciende la alerta de mantenciones pendientes del
   * Home ("Ir a registrar") y BodyClients lo apaga en cuanto lo consume, para
   * que no vuelva a seleccionar solo en la siguiente visita.
   */
  selectAllOnLoad: boolean;
  setDayFilter: (day: string) => void;
  setSelectAllOnLoad: (selectAll: boolean) => void;
}

export const createClientFilterSlice: StateCreator<ClientFilterSlice> = (
  set,
) => ({
  dayFilter: "",
  selectAllOnLoad: false,
  setDayFilter: (day: string) => set({ dayFilter: day }),
  setSelectAllOnLoad: (selectAll: boolean) =>
    set({ selectAllOnLoad: selectAll }),
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
