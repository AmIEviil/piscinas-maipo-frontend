import { useMutation } from "@tanstack/react-query";
import { useRefetchStore } from "../store/refetchStore";
import { useSnackbar } from "../utils/snackBarHooks";
import type { IVehicle } from "../service/vehicle.interface";
import { vehicleService } from "../core/services/VehiclesService";

export const useVehicles = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const vehiclesMutation = useMutation({
    mutationFn: vehicleService.getVehicles,
    onSuccess: () => {
      setShouldRefetch(false);
    },
  });
  return vehiclesMutation;
};

export const useVehicleByPatente = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const vehicleByPatenteMutation = useMutation({
    mutationFn: vehicleService.getVehicleByPatente,
    onSuccess: () => {
      setShouldRefetch(false);
    },
  });
  return vehicleByPatenteMutation;
};

export const useCreateVehicle = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const createVehicleMutation = useMutation({
    mutationFn: vehicleService.createVehicle,
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Vehículo creado exitosamente", "success");
    },
  });
  return createVehicleMutation;
};
export const useUpdateVehicle = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const updateVehicleMutation = useMutation({
    mutationFn: ({
      patente,
      vehicleData,
    }: {
      patente: string;
      vehicleData: Partial<IVehicle>;
    }) => vehicleService.updateVehicle(patente, vehicleData),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Vehículo actualizado exitosamente", "success");
    },
  });
  return updateVehicleMutation;
};
export const useDeleteVehicle = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const deleteVehicleMutation = useMutation({
    mutationFn: (patente: string) => vehicleService.deleteVehicle(patente),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Vehículo eliminado exitosamente", "success");
    },
  });
  return deleteVehicleMutation;
};
