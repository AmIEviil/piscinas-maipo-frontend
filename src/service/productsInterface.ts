export interface ITypeProduct {
  id: number;
  nombre: string;
}

export interface IProducto {
  id?: number;
  nombre: string;
  valor_unitario: number;
  cant_disponible: number;
  tipo: ITypeProduct;
}

export interface IMetricsProduct {
  tipo: string;
  disponibles: number;
  usados: number;
  porcentaje_utilizado: number;
}

export interface ICreateProductPayload {
  tipo: number;
  nombre: string;
  valor_unitario: number;
  cant_disponible: number;
}

export interface ICreateTypeProductPayload {
  nombre: string;
}
