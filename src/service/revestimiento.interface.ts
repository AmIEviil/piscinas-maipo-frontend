import type { Client } from "./client.interface";

export interface IRevestimientoCreate {
  fechaPropuesta: string;
  largoPiscina: number;
  anchoPiscina: number;
  profundidadMin: number;
  profundidadMax: number;
  profundidadAvg: number;
  areaPiscina: number;
  volumenPiscina: number;

  tipoRevestimiento: string;
  valorM2: number;
  costoManoObra: number;
  costoMateriales: number;
  costoTotal: number;
  valorTotal: number;
  porcentajeGanancia: number;

  estado: string;
  detalles?: string;
  garantia?: string;
  fechaInicio?: string;
  fechaTermino?: string;
  clienteId: string;
  client?: Client;
  imagenes: ICloudinaryImage[];
  extras?: IExtraRevestimientoCreate[];
}

export interface ICloudinaryImage {
  url: string;
  public_id: string;
}

export interface IRevestimiento {
  id: string;
  fechaPropuesta: string;
  largoPiscina: number;
  anchoPiscina: number;
  profundidadMin: number;
  profundidadMax: number;
  profundidadAvg: number;
  areaPiscina: number;
  volumenPiscina: number;
  tipoRevestimiento: string;
  valorM2: number;
  costoManoObra: number;
  costoMateriales: number;
  costoTotal: number;
  valorTotal: number;
  estado: string;
  detalles: string;
  garantia: string;
  fechaInicio: string;
  fechaTermino: string;
  client: Client;
  extras: IExtraRevestimiento[];
  imagenes: ICloudinaryImage[];
}

export interface IExtraRevestimiento {
  id: string;
  nombre: string;
  valor: number;
  detalle: string;
  revestimientoId?: string;
}

export interface IExtraRevestimientoCreate {
  nombre: string;
  valor: number;
  detalle: string;
}
