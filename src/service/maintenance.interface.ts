import { type IProducto } from "./products.interface";
export interface IMaintenance {
  id: string;
  fechaMantencion: Date;
  cantBidones: number;
  cantTabletas: number;
  otros: string;
  realizada: true;
  recibioPago: false;
  observaciones: string;
  productos: IProductosUtilizados[];
}
export interface IProductosUtilizados {
  id: string;
  product: IProducto;
  cantidad: number;
}

export interface IResumeMaintenance {
  dia: string;
  programadas: number;
  realizadas: number;
  faltantes: number;
}

export interface IMaintenanceCreate {
  fechaMantencion: string;
  realizada: boolean;
  recibioPago: boolean;
  valorMantencion: number;
  client: { id: string };
  productosUsados: { productId: string; cantidad: number }[];
  observaciones: string;
}
