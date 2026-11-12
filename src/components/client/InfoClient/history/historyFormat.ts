import { formatCLP, formatMoneyNumber } from "../../../../utils/formatTextUtils";

const ETIQUETAS: Record<string, string> = {
  nombre: "Nombre",
  direccion: "Dirección",
  comuna: "Comuna",
  telefono: "Teléfono",
  email: "Email",
  fecha_ingreso: "Fecha de ingreso",
  tipo_piscina: "Tipo de piscina",
  dia_mantencion: "Día de mantención",
  ruta: "Ruta",
  valor_mantencion: "Valor mantención",
  isActive: "Estado",
  frecuencia_mantencion: "Periodicidad",
};

/** Etiqueta legible de una clave de campo; una clave desconocida se muestra tal cual. */
export const etiquetaCampo = (campo: string | null): string =>
  campo === null ? "" : (ETIQUETAS[campo] ?? campo);

/**
 * El backend guarda todo normalizado como texto ('25000', 'true',
 * 'YYYY-MM-DD'); aca se vuelve a la forma que se lee en pantalla.
 */
export const formatearValorHistorial = (
  campo: string | null,
  valor: string | null
): string => {
  if (valor === null) return "—";

  if (campo === "valor_mantencion") {
    const monto = Number(valor);
    if (Number.isNaN(monto)) return valor;
    // formatMoneyNumber devuelve "" para 0; en el historial 0 es un dato.
    return formatMoneyNumber(monto) || formatCLP(monto);
  }
  if (campo === "isActive") {
    if (valor === "true") return "Activo";
    if (valor === "false") return "Inactivo";
    return valor;
  }
  if (campo === "fecha_ingreso") {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : valor;
  }
  return valor;
};

/** `dd-mm-yyyy HH:mm` en hora local. */
export const formatearFechaHistorial = (iso: string): string => {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${dos(fecha.getDate())}-${dos(fecha.getMonth() + 1)}-${fecha.getFullYear()} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
};
