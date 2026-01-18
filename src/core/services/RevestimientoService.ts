import type {
  ICloudinaryImage,
  IRevestimiento,
  IRevestimientoCreate,
} from "../../service/revestimiento.interface";
import { REVESTIMIENTO_API } from "../api/revestimiento/api";
import apiClient from "../client/client";

export const revestimientoService = {
  getRevestimientos: async (): Promise<IRevestimiento[]> => {
    const response = await apiClient.get(REVESTIMIENTO_API.revestimientos);
    return response.data;
  },

  getRevestimientoById: async (id: string): Promise<IRevestimiento> => {
    const response = await apiClient.get(
      REVESTIMIENTO_API.revestimientoId.replace(":id", id.toString())
    );
    return response.data;
  },

  createNewRevestimiento: async (
    data: Partial<IRevestimientoCreate>
  ): Promise<IRevestimiento> => {
    const response = await apiClient.post<IRevestimiento>(
      REVESTIMIENTO_API.revestimientos,
      data
    );
    return response.data;
  },

  updateRevestimiento: async (
    id: string,
    data: IRevestimiento
  ): Promise<IRevestimiento> => {
    const response = await apiClient.put<IRevestimiento>(
      `${REVESTIMIENTO_API.revestimientoId}/${id}`,
      data
    );
    return response.data;
  },

  deleteRevestimiento: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      REVESTIMIENTO_API.revestimientoId.replace(":id", id.toString())
    );
    return response.data;
  },

  uploadImagen: async (file: File): Promise<ICloudinaryImage> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ICloudinaryImage>(
      `api/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  addImagesBulk: async (
    revestimientoId: string,
    urls: {
      url: string;
      public_id: string;
    }[]
  ) => {
    const res = await apiClient.post(
      `/api/upload/revestimiento/${revestimientoId}/imagenes/bulk`,
      { urls }
    );
    return res.data;
  },

  generatePropuestaRevestimiento: async (revestimientoId: string) => {
    const response = await apiClient.get(
      REVESTIMIENTO_API.generatePropuesta.replace(":id", revestimientoId),
      { responseType: "blob" }
    );
    return response.data;
  },

  uploadPropuestaRevestimiento: async (
    revestimientoId: string,
    file: File
  ): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ message: string }>(
      REVESTIMIENTO_API.uploadPropuesta.replace(":parentId", revestimientoId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
