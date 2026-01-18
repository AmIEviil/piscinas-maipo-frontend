import apiClient from "../client/client";
import { COMPROBANTE_PAGOS_API } from "../api/comprobante-pagos/api";
import type { IComprobantePago } from "../../service/ComprobantePagos.interface";

export const comprobantePagosService = {
  uploadComprobante: async (payload: FormData) => {
    const response = await apiClient.post(
      COMPROBANTE_PAGOS_API.upload,
      payload,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );
    return response.data;
  },

  getComprobantesByParentId: async (
    parentId: string
  ): Promise<IComprobantePago[]> => {
    const url = COMPROBANTE_PAGOS_API.getByParentId.replace(
      ":parentId",
      parentId.toString()
    );
    const response = await apiClient.get(url);
    return response.data;
  },
};
