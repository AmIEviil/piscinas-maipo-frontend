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

export interface IProductoMantencion {
  productId: string;
  cantidad: number;
}

export interface IMaintenanceCreate {
  fechaMantencion: string;
  realizada: boolean;
  recibioPago: boolean;
  valorMantencion: number;
  client: { id: string };
  productosUsados: IProductoMantencion[];
  observaciones: string;
}

export interface IMaintenanceUpdate {
  fechaMantencion?: string;
  realizada?: boolean;
  recibioPago?: boolean;
  valorMantencion?: number;
  productosUsados?: IProductoMantencion[];
  observaciones?: string;
}
