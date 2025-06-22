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

export interface IProducto {
  id: number;
  nombre: string;
  valor_unitario: number;
  cant_disponibe: number;
}

export interface IProductosUtilizados {
  id: number;
  product: IProducto;
}
