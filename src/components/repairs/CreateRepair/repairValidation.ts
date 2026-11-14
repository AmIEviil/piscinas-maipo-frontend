import type { IRepairCreate } from "../../../service/repairs.interface";

export type CampoReparacion =
  | "cliente"
  | "fecha_ingreso"
  | "fecha_trabajo"
  | "detalles"
  | "materiales"
  | "costo_reparacion"
  | "valor_reparacion";

/**
 * Campos que el backend exige (CreateRepairDto). Devuelve un mensaje por
 * cada uno que falte; objeto vacio = formulario valido.
 */
export const validarReparacion = (
  r: Partial<IRepairCreate>,
): Partial<Record<CampoReparacion, string>> => {
  const errores: Partial<Record<CampoReparacion, string>> = {};
  const vacio = (t?: string) => !t || !t.trim();
  const montoInvalido = (n?: number) =>
    n === undefined || n === null || Number.isNaN(n) || n < 0;

  if (!(r.client_id || r.client?.id)) errores.cliente = "Elige un cliente";
  if (vacio(r.fecha_ingreso))
    errores.fecha_ingreso = "Elige la fecha de ingreso";
  if (vacio(r.fecha_trabajo))
    errores.fecha_trabajo = "Elige la fecha de trabajo";
  if (vacio(r.detalles)) errores.detalles = "Describe qué se va a reparar";
  if (vacio(r.materiales)) errores.materiales = "Indica los materiales";
  if (montoInvalido(r.costo_reparacion))
    errores.costo_reparacion = "Ingresa el costo (puede ser 0)";
  if (montoInvalido(r.valor_reparacion))
    errores.valor_reparacion = "Ingresa el valor (puede ser 0)";
  return errores;
};
