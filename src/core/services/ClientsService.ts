import type { Client } from "../../service/clientInterface";
import { CLIENT_API } from "../api/clients/api";
import apiClient from "../client/client";

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    const response = await apiClient.get(CLIENT_API.clients);
    return response.data;
  },
};
