import type { Client } from "./client.interface";

export interface IRepair {
  id: string;
  client: Client;
  fecha_ingreso: string;
  fecha_trabajo: string;
  detalles: string;
  materiales: string;
  costo_reparacion: number;
  valor_reparacion: number;
  estado: string;
  garantia: string;
}

export interface IRepairCreate {
  client_id: string;
  client?: Client;
  fecha_ingreso: string;
  fecha_trabajo: string;
  detalles: string;
  materiales: string;
  costo_reparacion: number;
  valor_reparacion: number;
  estado: string;
  garantia: string;
}
