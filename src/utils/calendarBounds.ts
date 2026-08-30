import { DateTime } from "luxon";

/**
 * Limites de fecha para CustomCalendarV2.
 *
 * Un limite se expresa como un `Date` fijo o como un token relativo a hoy.
 * Los tokens existen para que el padre no tenga que construir un `Date` nuevo
 * en cada render: `minDate="today"` es una constante de string, asi que el
 * memo del calendario no se invalida solo, cosa que si pasaria con
 * `minDate={new Date()}`.
 *
 * "Hoy" se calcula en la zona de Santiago, no en la del navegador: la
 * aplicacion opera en Chile y el corte de dia tiene que ser el mismo para
 * todos, aunque el equipo tenga mal el huso horario.
 */
export type CalendarPastBoundToken = "today" | "yesterday" | "startOfMonth";
export type CalendarFutureBoundToken = "today" | "tomorrow" | "endOfMonth";

export type CalendarBound<T extends string> = Date | T;

export const ZONA_HORARIA = "America/Santiago";

/** Hoy en Santiago, como `Date` local a medianoche. */
export const getSantiagoToday = (): Date => {
  const hoy = DateTime.now().setZone(ZONA_HORARIA);
  return new Date(hoy.year, hoy.month - 1, hoy.day);
};

/** Clave "YYYY-MM-DD" de un `Date`, leida en hora local (sin pasar por UTC). */
export const toDateKey = (date: Date): string => {
  const anio = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

/**
 * Traduce un limite a su clave "YYYY-MM-DD", o `null` si no hay limite.
 *
 * Las claves en este formato son comparables lexicograficamente, que es como
 * el calendario decide si un dia esta fuera de rango sin construir un `Date`
 * por celda.
 */
export const resolveCalendarBoundKey = (
  bound?: CalendarBound<CalendarPastBoundToken | CalendarFutureBoundToken>,
): string | null => {
  if (!bound) return null;

  if (bound instanceof Date) {
    return Number.isNaN(bound.getTime()) ? null : toDateKey(bound);
  }

  const hoy = getSantiagoToday();

  switch (bound) {
    case "today":
      return toDateKey(hoy);
    case "yesterday":
      return toDateKey(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1));
    case "tomorrow":
      return toDateKey(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1));
    case "startOfMonth":
      return toDateKey(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    case "endOfMonth":
      return toDateKey(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
    default:
      return null;
  }
};
