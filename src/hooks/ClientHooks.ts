import { useMutation } from "@tanstack/react-query";
import { clientService } from "../core/services/ClientsService";
import type { Client } from "../service/client.interface";
import { useSnackbar } from "../utils/snackBarHooks";

export const useClient = () => {
  const clientMutation = useMutation({
    mutationFn: clientService.getClients,
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
  const { showSnackbar } = useSnackbar();
  const createClientMutation = useMutation({
    mutationFn: clientService.createNewClient,
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: () => {
      showSnackbar("Cliente creado exitosamente", "success");
    },
  });
  return createClientMutation;
};

export const useUpdateClient = () => {
  const { showSnackbar } = useSnackbar();
  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: Client }) =>
      clientService.updateNewClient(clientId, data),
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: () => {
      showSnackbar("Cliente actualizado exitosamente", "success");
    },
  });
  return updateClientMutation;
};

export const useDeleteClient = () => {
  const { showSnackbar } = useSnackbar();
  const deleteClientMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: () => {
      showSnackbar("Cliente eliminado exitosamente", "success");
    },
  });
  return deleteClientMutation;
};
