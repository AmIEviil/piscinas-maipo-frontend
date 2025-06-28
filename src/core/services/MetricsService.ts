import type { IResumeMaintenance } from "../../service/maintenanceInterface";
import { METRICS_API } from "../api/metrics/api";
import apiClient from "../client/client";

export const metricsService = {
  getDailyMetrics: async (): Promise<IResumeMaintenance[]> => {
    const response = await apiClient.get(METRICS_API.daily);
    return response.data;
  },
};
