/**
 * Reglas de horario para la alerta de mantenciones pendientes del Home.
 */

/**
 * Los mismos valores que usa el filtro de clientes (constantBodyClient.dias) y
 * que devuelve GET api/metrics/daily en el campo `dia`. Con tilde en Miercoles,
 * porque asi estan guardados en la columna dia_mantencion.
 */
export const DIAS_HABILES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
] as const;

/** A partir de esta hora local se avisa que quedan mantenciones sin cargar. */
export const HORA_ALERTA_MANTENCIONES = 18;

/**
 * Devuelve el dia habil de hoy con el mismo texto que usa el backend, o null
 * si es sabado o domingo (no hay mantenciones programadas ese dia).
 */
export const getDiaHabilActual = (date: Date = new Date()): string | null => {
  const diaSemana = date.getDay(); // 0 = domingo ... 6 = sabado
  if (diaSemana < 1 || diaSemana > 5) return null;
  return DIAS_HABILES[diaSemana - 1];
};

/** True si ya paso la hora de corte del dia. */
export const esHoraDeAvisarMantenciones = (date: Date = new Date()): boolean =>
  date.getHours() >= HORA_ALERTA_MANTENCIONES;
