import {
  type IMaintenance,
  type IMaintenanceCreate,
} from "../../service/maintenanceInterface";
import { MAINTENANCE_API } from "../api/maintenance/api";
import apiClient from "../client/client";

export const maintenanceService = {
  getMaintenances: async (): Promise<IMaintenance[]> => {
    const response = await apiClient.get(MAINTENANCE_API.maintenances);
    return response.data;
  },

  getMaintenancesByClientId: async (
    id: string
  ): Promise<Record<string, IMaintenance[]>> => {
    const url = MAINTENANCE_API.maintenancesByClientId.replace(
      ":id",
      id.toString()
    );
    const response = await apiClient.get(url);
    return response.data;
  },

  createMaintenance: async (dto: IMaintenanceCreate): Promise<IMaintenance> => {
    const response = await apiClient.post(MAINTENANCE_API.maintenances, dto);
    return response.data;
  },
};
