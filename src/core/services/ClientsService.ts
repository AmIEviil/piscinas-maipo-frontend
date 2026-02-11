 
import type {
  Client,
  ClientFilters,
  IClientForm,
} from "../../service/client.interface";
import type { IFieldPayload } from "../../utils/formUtils";
import { CLIENT_API } from "../api/clients/api";
import apiClient from "../client/client";

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    const response = await apiClient.get(CLIENT_API.clients);
    return response.data;
  },
  getClientsByFilters: async (
    filters: ClientFilters
  ): Promise<Record<string, Client[]>> => {
    const response = await apiClient.get("/api/clients/filter", {
      params: filters,
    });
    return response.data;
  },

  getClientById: async (id: string): Promise<IClientForm> => {
    const url = CLIENT_API.clientId.replace(":id", id.toString());
    const response = await apiClient.get<IClientForm>(url);
    return response.data;
  },

  createNewClient: async (data: Client): Promise<Client> => {
    const response = await apiClient.post<Client>(
      CLIENT_API.createClient,
      data
    );
    return response.data;
  },

  updateNewClient: async (id: string, data: Client): Promise<Client> => {
    const url = CLIENT_API.updateClient.replace(":id", id.toString());
    const response = await apiClient.put<Client>(url, data);
    return response.data;
  },

  deleteClient: async (id: string): Promise<{ message: string }> => {
    const url = CLIENT_API.deleteClient.replace(":id", id.toString());
    const response = await apiClient.delete(url);
    return response.data;
  },

  updateClientField: async (
    id: string,
    dto: IFieldPayload[]
  ): Promise<Client> => {
    const url = CLIENT_API.updateClientField.replace(":id", id.toString());
    const response = await apiClient.put<Client>(url, dto);
    return response.data;
  },
};
