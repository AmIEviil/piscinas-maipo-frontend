// Lo minimo de una mantencion registrada que hace falta para cobrarla. Tipado
// aparte de IMaintenance porque ahi `realizada` quedo como el literal `true`.
interface VisitaCobrable {
  realizada: boolean;
  valor_mantencion?: number | null;
  productos: { product: { valor_unitario: number }; cantidad: number }[];
}

/**
 * Precio de una visita ya registrada: el que quedo guardado en la propia
 * mantencion. Las mantenciones registradas conservan su precio aunque despues
 * cambie el valor del cliente; el valor actual del cliente solo se usa si la
 * visita no trae el suyo.
 */
export const valorDeVisita = (
  mantencion: Pick<VisitaCobrable, "valor_mantencion">,
  valorCliente: number,
): number => mantencion.valor_mantencion ?? valorCliente;

/**
 * Total cobrable de un mes: cada visita realizada a su propio precio, mas los
 * productos usados en todas las visitas del mes.
 */
export const totalCobrableDelMes = (
  mantenciones: VisitaCobrable[],
  valorCliente: number,
): number =>
  mantenciones.reduce((suma, mantencion) => {
    const totalProductos = mantencion.productos.reduce(
      (subtotal, p) => subtotal + p.product.valor_unitario * p.cantidad,
      0,
    );
    const valorVisita = mantencion.realizada
      ? valorDeVisita(mantencion, valorCliente)
      : 0;
    return suma + valorVisita + totalProductos;
  }, 0);
