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
      },
    );
    return response.data;
  },

  getComprobantesByParentId: async (
    parentId: string,
  ): Promise<Record<string, IComprobantePago[]>> => {
    const url = COMPROBANTE_PAGOS_API.getByParentId.replace(
      ":parentId",
      parentId.toString(),
    );
    const response = await apiClient.get(url);
    return response.data;
  },

  deleteComprobante: async (comprobanteId: string) => {
    const url = COMPROBANTE_PAGOS_API.delete.replace(
      ":comprobanteId",
      comprobanteId.toString(),
    );
    const response = await apiClient.delete(url);
    return response.data;
  },
};
