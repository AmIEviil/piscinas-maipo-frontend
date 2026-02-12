import { useMutation } from "@tanstack/react-query";
import { comprobantePagosService } from "../core/services/ComprobantePagosService";
import { useRefetchStore } from "../store/refetchStore";
import { useSnackbar } from "../utils/snackBarHooks";

export const useGetComprobantesByParentId = () => {
  const getComprobantesByParentIdMutation = useMutation({
    mutationFn: comprobantePagosService.getComprobantesByParentId,
  });
  return getComprobantesByParentIdMutation;
};

export const useUploadComprobantePago = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const uploadComprobantePagoMutation = useMutation({
    mutationFn: comprobantePagosService.uploadComprobante,
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Comprobante de pago subido correctamente", "success");
    },
    onError: () => {
      showSnackbar(
        "Error al subir el comprobante de pago, por favor intente nuevamente",
        "error",
      );
    },
  });
  return uploadComprobantePagoMutation;
};

export const useDeleteComprobantePago = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const deleteComprobantePagoMutation = useMutation({
    mutationFn: comprobantePagosService.deleteComprobante,
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Comprobante de pago eliminado correctamente", "success");
    },
    onError: () => {
      showSnackbar(
        "Error al eliminar el comprobante de pago, por favor intente nuevamente",
        "error",
      );
    },
  });
  return deleteComprobantePagoMutation;
};
