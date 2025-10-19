import { useMutation } from "@tanstack/react-query";
import { clientService } from "../core/services/ClientsService";
import type { Client } from "../service/clientInterface";

export const useClient = () => {
  const clientMutation = useMutation({
    mutationFn: clientService.getClients,
    // onError: (error: unknown) => {
    //   console.log(error);
    // },
    // onSuccess: (data) => {
    // },
  });
  return clientMutation;
};

export const useClientsByFilters = () => {
  return useMutation({
    mutationFn: clientService.getClientsByFilters,
    onError: (error) => {
      console.error("Error al filtrar clientes:", error);
    },
  });
};

export const useCreateClient = () => {
  const createClientMutation = useMutation({
    mutationFn: clientService.createNewClient,
    onError: (error: unknown) => {
      console.log(error);
    },
  });
  return createClientMutation;
};

export const useUpdateClient = () => {
  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: number; data: Client }) =>
      clientService.updateNewClient(clientId, data),
    onError: (error: unknown) => {
      console.log(error);
    },
  });
  return updateClientMutation;
};

export const useDeleteClient = () => {
  const deleteClientMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onError: (error: unknown) => {
      console.log(error);
    },
  });
  return deleteClientMutation;
};
