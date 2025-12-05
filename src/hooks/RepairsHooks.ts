import { useMutation } from "@tanstack/react-query";
import { repairsService } from "../core/services/RepairsService";
import type { IRepairCreate } from "../service/repairs.interface";

export const useRepairs = () => {
  const repairsMutation = useMutation({
    mutationFn: repairsService.getRepairs,
  });
  return repairsMutation;
};
export const useRepairById = () => {
  const repairByIdMutation = useMutation({
    mutationFn: repairsService.getRepairById,
  });
  return repairByIdMutation;
};

export const useCreateRepair = () => {
  const createRepairMutation = useMutation({
    mutationFn: repairsService.createNewRepair,
  });
  return createRepairMutation;
};

export const useUpdateRepair = () => {
  const updateRepairMutation = useMutation({
    mutationFn: ({
      repairId,
      data,
    }: {
      repairId: string;
      data: Partial<IRepairCreate>;
    }) => repairsService.updateRepair(repairId, data),
  });
  return updateRepairMutation;
};

export const useDeleteRepair = () => {
  const deleteRepairMutation = useMutation({
    mutationFn: repairsService.deleteRepair,
  });
  return deleteRepairMutation;
};
