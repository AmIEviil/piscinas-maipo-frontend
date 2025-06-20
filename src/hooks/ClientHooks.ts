import { useMutation } from "@tanstack/react-query";
import { clientService } from "../core/services/ClientsService";

export const useClient = () => {
  const clientMutation = useMutation({
    mutationFn: clientService.getClients,
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  return clientMutation;
};
