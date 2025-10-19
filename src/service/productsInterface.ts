export interface IProducto {
  id?: number;
  nombre: string;
  valor_unitario: number;
  cant_disponible: number;
}

export interface IMetricsProduct {
  tipo: string;
  disponibles: number;
  usados: number;
  porcentaje_utilizado: number;
}
