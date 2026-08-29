import { useMutation, useQuery } from "@tanstack/react-query";
import { clientService } from "../core/services/ClientsService";
import type { Client } from "../service/client.interface";
import { useSnackbar } from "../utils/snackBarHooks";
import type { IFieldPayload } from "../utils/formUtils";
import { useRefetchStore } from "../store/refetchStore";

export const useClient = () => {
  const clientMutation = useMutation({
    mutationFn: clientService.getClients,
  });
  return clientMutation;
};

/**
 * Periodicidades de mantencion (Semanal / Quincenal / Mensual).
 *
 * `useQuery` y no `useMutation` como el resto del archivo: es un catalogo de
 * tres filas que no cambia entre sesiones y lo consumen a la vez el selector
 * de crear/editar, la ficha y el filtro avanzado. Con una mutacion cada uno
 * dispararia su propia peticion.
 */
export const useFrecuenciasMantencion = () =>
  useQuery({
    queryKey: ["frecuencias-mantencion"],
    queryFn: clientService.getFrecuencias,
    staleTime: Infinity,
  });

export const useClientsById = () => {
  return useMutation({
    mutationFn: (id: string) => clientService.getClientById(id),
  });
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
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const createClientMutation = useMutation({
    mutationFn: clientService.createNewClient,
    onError: () => {
      showSnackbar("Error al crear el cliente", "error");
    },
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Cliente creado exitosamente", "success");
    },
  });
  return createClientMutation;
};

export const useUpdateClient = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: Client }) =>
      clientService.updateNewClient(clientId, data),
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Cliente actualizado exitosamente", "success");
    },
  });
  return updateClientMutation;
};

export const useUpdateClientField = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();

  const updateClientFieldMutation = useMutation({
    mutationFn: ({
      clientId,
      dto,
    }: {
      clientId: string;
      dto: IFieldPayload[];
    }) => clientService.updateClientField(clientId, dto),
    onError: (error: unknown) => {
      showSnackbar(
        `Error al actualizar el campo del cliente. Error: ${error}`,
        "error"
      );
    },
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Campo del cliente actualizado exitosamente", "success");
    },
  });
  return updateClientFieldMutation;
};

/**
 * Cambio masivo de dia, ruta o periodicidad para los clientes seleccionados.
 *
 * No muestra snackbar de exito: el resumen del cambio (cuantos clientes y si
 * hubo mantenciones reprogramadas) lo arma quien la llama, que es el unico que
 * sabe que campo se toco y con que etiquetas mostrarlo.
 */
export const useBulkUpdateClients = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: clientService.bulkUpdateClients,
    onError: () => {
      showSnackbar("No se pudo aplicar el cambio a los clientes", "error");
    },
    onSuccess: () => {
      setShouldRefetch(true);
    },
  });
};

export const useDeleteClient = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();

  const deleteClientMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Cliente eliminado exitosamente", "success");
    },
  });
  return deleteClientMutation;
};
