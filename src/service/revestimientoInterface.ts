import type { Client } from "./clientInterface";

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
  clienteId : string;
  client?: Client;
  imagenes: ICloudinaryImage[];
}

export interface ICloudinaryImage {
  url: string;
  publicId: string;
}

export interface IRevestimiento {
  id : string;
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
}

export interface IExtraRevestimiento {
  id : string;
  nombre: string;
  valor: number;
  detalle: string;
  revestimientoId : string;
}
