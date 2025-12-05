import { useMutation } from "@tanstack/react-query";
import { revestimientoService } from "../core/services/RevestimientoService";
import type { IRevestimiento } from "../service/revestimiento.interface";

export const useRevestimiento = () => {
  const revestimientoMutation = useMutation({
    mutationFn: revestimientoService.getRevestimientos,
  });

  return revestimientoMutation;
};

export const useRevestimientoById = () => {
  const revestimientoByIdMutation = useMutation({
    mutationFn: revestimientoService.getRevestimientoById,
  });

  return revestimientoByIdMutation;
};

export const useCreateRevestimiento = () => {
  const createRevestimientoMutation = useMutation({
    mutationFn: revestimientoService.createNewRevestimiento,
  });

  return createRevestimientoMutation;
};

export const useUpdateRevestimiento = () => {
  const updateRevestimientoMutation = useMutation({
    mutationFn: ({
      revestimientoId,
      data,
    }: {
      revestimientoId: string;
      data: IRevestimiento;
    }) => revestimientoService.updateRevestimiento(revestimientoId, data),
  });
  return updateRevestimientoMutation;
};

export const useDeleteRevestimiento = () => {
  const deleteRevestimientoMutation = useMutation({
    mutationFn: revestimientoService.deleteRevestimiento,
  });
  return deleteRevestimientoMutation;
};
