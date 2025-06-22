import { useMutation } from "@tanstack/react-query";
import { maintenanceService } from "../core/services/MaintenanceService";

export const useMaintenances = () => {
  const maintenanceMutation = useMutation({
    mutationFn: maintenanceService.getMaintenances,
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  return maintenanceMutation;
};

export const useMaintenancesByClient = () => {
  const maintenanceByClientMutation = useMutation({
    mutationFn: maintenanceService.getMaintenancesByClientId,
    onError: (error: unknown) => {
      console.log("Error al obtener mantenimientos por cliente:", error);
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return maintenanceByClientMutation;
};
