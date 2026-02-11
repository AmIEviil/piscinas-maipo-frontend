import type { IUploadedFile } from "./uploadedFiles.interface";

export interface IFilterVehiclesDto {
  placa?: string;
  marca?: string;
  modelo?: string;
  anioDesde?: number;
  anioHasta?: number;
  color?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface IVehicle {
  id?: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  ultima_mantencion: string;
  kilometraje: number;
  tipo_combustible?: string;
  chofer_asignado?: string;
  copiloto_asignado?: string;
  isActive: boolean;
}

export type IVehicleResponse = {
  vehicle: IVehicle;
  files: IUploadedFile[];
};
