import { useMutation } from "@tanstack/react-query";
import { maintenanceService } from "../core/services/MaintenanceService";
import { useRefetchStore } from "../store/refetchStore";
import { useSnackbar } from "../utils/snackBarHooks";
import type { IMaintenanceUpdate } from "../service/maintenance.interface";

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
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const createMaintenanceMutation = useMutation({
    mutationFn: maintenanceService.createMaintenance,
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Mantención creado correctamente", "success");
    },
    onError: () => {
      showSnackbar(
        "Error al crear el mantenimiento, por favor intente nuevamente",
        "error",
      );
    },
  });

  return createMaintenanceMutation;
};

export const useUpdateMaintenance = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const updateMaintenanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IMaintenanceUpdate }) =>
      maintenanceService.updateMaintenance(id, data),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Mantención actualizado correctamente", "success");
    },
    onError: () => {
      showSnackbar(
        "Error al actualizar el mantenimiento, por favor intente nuevamente",
        "error",
      );
    },
  });
  return updateMaintenanceMutation;
};

export const useDeleteMaintenance = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const deleteMaintenanceMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.deleteMaintenance(id),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Mantención eliminado correctamente", "success");
    },
    onError: () => {
      showSnackbar(
        "Error al eliminar el mantenimiento, por favor intente nuevamente",
        "error",
      );
    },
  });
  return deleteMaintenanceMutation;
}
