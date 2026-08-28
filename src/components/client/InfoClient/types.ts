/**
 * Tipos compartidos del modal de ficha del cliente.
 *
 * Viven aparte de los componentes a proposito: `ClientStore` los consume, y
 * mientras estuvieron declarados dentro de un .tsx cualquier reorganizacion
 * de componentes rompia el store.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * La ficha del cliente tal como la maneja el modal: un mapa de campo a
 * { key, value, type }. La forma la impone el backend de clientes.
 */
export interface IClientForm {
  [key: string]: {
    key: string;
    value: any;
    type: string;
  };
}

export interface ResumenMaterial {
  cantidad: number;
  valorUnitario: number;
  total: number;
}

export interface ResumenMonth {
  resumenMateriales: Record<string, ResumenMaterial>;
  mes: string;
  totalMantencion: number;
  totalProductos: number;
  granTotal: number;
}
