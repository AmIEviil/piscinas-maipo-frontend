import {
  type IMaintenance,
  //   IProducto,
} from "../../service/maintenanceInterface";
import { MAINTENANCE_API } from "../api/maintenance/api";
import apiClient from "../client/client";

export const maintenanceService = {
  getMaintenances: async (): Promise<IMaintenance[]> => {
    const response = await apiClient.get(MAINTENANCE_API.maintenances);
    return response.data;
  },

  getMaintenancesByClientId: async (id: number): Promise<IMaintenance[]> => {
    const url = MAINTENANCE_API.maintenancesByClientId.replace(
      ":id",
      id.toString()
    );
    const response = await apiClient.get(url);
    return response.data;
  },
};
