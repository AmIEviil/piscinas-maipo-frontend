import type { FilterQueryRepairs } from "../../components/repairs/BodyRepairs";
import type { IRepair, IRepairCreate } from "../../service/repairs.interface";
import { REPAIRS_API } from "../api/reparacion/api";
import apiClient from "../client/client";

export const repairsService = {
  getRepairs: async (filterQuery?: FilterQueryRepairs): Promise<IRepair[]> => {
    const response = await apiClient.get(REPAIRS_API.repairs, {
      params: filterQuery,
    });
    return response.data;
  },

  getRepairById: async (id: string): Promise<IRepair> => {
    const response = await apiClient.get(
      REPAIRS_API.repairId.replace(":id", id.toString()),
    );
    return response.data;
  },

  createNewRepair: async (data: Partial<IRepairCreate>): Promise<IRepair> => {
    const response = await apiClient.post<IRepair>(REPAIRS_API.repairs, data);
    return response.data;
  },
  updateRepair: async (
    id: string,
    data: Partial<IRepairCreate>,
  ): Promise<IRepair> => {
    const response = await apiClient.put<IRepair>(
      `${REPAIRS_API.repairId}/${id}`,
      data,
    );
    return response.data;
  },
  deleteRepair: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      REPAIRS_API.repairId.replace(":id", id.toString()),
    );
    return response.data;
  },
};
