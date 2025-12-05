import { create, type StateCreator } from "zustand";
import { clientService } from "../core/services/ClientsService";
import type { Client } from "../service/client.interface";

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
  set
) => ({
  dayFilter: "",
  setDayFilter: (day: string) => set({ dayFilter: day }),
});
