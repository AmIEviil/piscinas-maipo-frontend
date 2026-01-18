import { useMutation } from "@tanstack/react-query";
import { comprobantePagosService } from "../core/services/ComprobantePagosService";
import { useRefetchStore } from "../store/refetchStore";
import { useSnackbar } from "../utils/snackBarHooks";

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
        "error"
      );
    },
  });
  return uploadComprobantePagoMutation;
};

export const useGetComprobantesByParentId = () => {
  const getComprobantesByParentIdMutation = useMutation({
    mutationFn: comprobantePagosService.getComprobantesByParentId,
  });
  return getComprobantesByParentIdMutation;
};
