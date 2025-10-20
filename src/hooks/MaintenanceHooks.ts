import { useMutation } from "@tanstack/react-query";
import { maintenanceService } from "../core/services/MaintenanceService";

export const useMaintenances = () => {
  const maintenanceMutation = useMutation({
    mutationFn: maintenanceService.getMaintenances,
  });
  return maintenanceMutation;
};

export const useMaintenancesByClient = () => {
  const maintenanceByClientMutation = useMutation({
    mutationFn: maintenanceService.getMaintenancesByClientId,
  });

  return maintenanceByClientMutation;
};

export const useCreateMaintenance = () => {
  const createMaintenanceMutation = useMutation({
    mutationFn: maintenanceService.createMaintenance,
  });

  return createMaintenanceMutation;
};
