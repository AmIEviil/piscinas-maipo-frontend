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
  clienteId: number;
  client?: Client;
  imagenes: ICloudinaryImage[];
}

export interface ICloudinaryImage {
  url: string;
  publicId: string;
}

export interface IRevestimiento {
  id: number;
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
  id: number;
  nombre: string;
  valor: number;
  detalle: string;
  revestimientoId: number;
}
