import type {
  IFilterVehiclesDto,
  IVehicle,
  IVehicleResponse,
} from "../../service/vehicle.interface";
import { VEHICLES_API } from "../api/vehicles/api";
import apiClient from "../client/client";

export const vehicleService = {
  getVehicles: async (filters?: IFilterVehiclesDto): Promise<IVehicle[]> => {
    const response = await apiClient.get(VEHICLES_API.vehicles, {
      params: filters,
    });
    return response.data;
  },
  getVehicleByPatente: async (patente: string): Promise<IVehicleResponse> => {
    const endpoint = VEHICLES_API.vehiclesPatente.replace(":patente", patente);
    const response = await apiClient.get(endpoint);
    return response.data;
  },
  createVehicle: async (vehicleData: IVehicle): Promise<IVehicle> => {
    const response = await apiClient.post(VEHICLES_API.vehicles, vehicleData);
    return response.data;
  },
  updateVehicle: async (
    patente: string,
    vehicleData: Partial<IVehicle>,
  ): Promise<IVehicle> => {
    const endpoint = VEHICLES_API.vehiclesPatente.replace(":patente", patente);
    const response = await apiClient.post(endpoint, vehicleData);
    return response.data;
  },
  deleteVehicle: async (patente: string): Promise<void> => {
    const endpoint = VEHICLES_API.vehiclesPatente.replace(":patente", patente);
    await apiClient.delete(endpoint);
  },
};
