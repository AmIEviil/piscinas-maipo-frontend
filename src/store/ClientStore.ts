import { create } from "zustand";
import { clientService } from "../core/services/ClientsService";
import type { Client } from "../service/clientInterface";

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
