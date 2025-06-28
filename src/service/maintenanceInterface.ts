import { type IProducto } from "../service/productsInterface";
export interface IMaintenance {
  id: number;
  fechaMantencion: Date;
  cantBidones: number;
  cantTabletas: number;
  otros: string;
  realizada: true;
  recibioPago: false;
  productos: IProductosUtilizados[];
}
export interface IProductosUtilizados {
  id: number;
  product: IProducto;
}

export interface IResumeMaintenance {
  dia: string;
  programadas: number;
  realizadas: number;
  faltantes: number;
}
