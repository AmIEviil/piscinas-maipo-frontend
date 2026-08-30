import { DateTime } from "luxon";

/**
 * Proyeccion de las visitas de un cliente segun su periodicidad.
 *
 * El dia de la semana siempre lo manda `dia_mantencion`: la periodicidad solo
 * decide *cual* de esos martes toca. Por eso el ancla nunca se usa tal cual,
 * sino corrida hacia adelante hasta el proximo dia de mantencion -- un cliente
 * puede haber ingresado un miercoles y visitarse los martes.
 */

const PASO_DIAS: Record<string, number> = {
  semanal: 7,
  quincenal: 14,
};

/** Nombre de dia (con o sin tilde) al numero de dia de Luxon: 1 = lunes. */
const DIAS: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 7,
};

const normalizar = (texto: unknown) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const aDateTime = (valor: string | Date | null | undefined): DateTime | null => {
  if (!valor) return null;
  // Las fechas del API llegan como "YYYY-MM-DD" (a veces con hora ISO). Se
  // corta en la T y se parsea con Luxon en hora local: `new Date("2026-08-11")`
  // se interpreta como medianoche UTC y en Chile devuelve el dia anterior.
  const fecha =
    typeof valor === "string"
      ? DateTime.fromISO(String(valor).split("T")[0])
      : DateTime.fromJSDate(valor);
  return fecha.isValid ? fecha.startOf("day") : null;
};

/** Corre la fecha hacia adelante hasta caer en el dia de la semana pedido. */
const alinearAlDia = (fecha: DateTime, diaObjetivo: number) =>
  fecha.plus({ days: (diaObjetivo - fecha.weekday + 7) % 7 });

/**
 * Visita mensual del mes pedido, en el mismo ordinal de semana que el ancla.
 *
 * "Mensual" es una visita por mes calendario, no cada 28 dias: si el ancla es
 * el 2do martes, se proyecta el 2do martes de cada mes. Con 28 dias fijos la
 * fecha se corre un poco cada mes y termina cayendo dos veces en el mismo mes
 * -- y como el cobro del mes multiplica el valor por las visitas realizadas,
 * ese mes se cobraria al doble sin que nadie lo haya decidido.
 */
const visitaMensual = (
  inicioMes: DateTime,
  diaObjetivo: number,
  ordinal: number,
): DateTime => {
  const primero = alinearAlDia(inicioMes, diaObjetivo);
  let candidato = primero.plus({ weeks: ordinal - 1 });
  // Un mes puede no tener 5tos martes: se cae al ultimo que si existe.
  while (candidato.month !== inicioMes.month) {
    candidato = candidato.minus({ weeks: 1 });
  }
  return candidato;
};

export interface ParametrosProyeccion {
  /** `dia_mantencion` del cliente, p. ej. "Martes". */
  diaMantencion?: string;
  /** Nombre de la periodicidad. Cualquier cosa desconocida se trata como semanal. */
  frecuencia?: string;
  /**
   * Desde donde se cuenta el ciclo: la fecha de la ultima mantencion
   * registrada, o `fecha_ingreso` si el cliente no tiene ninguna.
   */
  ancla?: string | Date | null;
  /** Mes a proyectar, en formato "YYYY-MM". */
  mes: string;
  /** Fechas ya registradas: se excluyen para no duplicar el nodo real. */
  registradas?: (string | Date)[];
}

/**
 * Fechas en que deberia visitarse al cliente durante `mes`, excluyendo las que
 * ya tienen una mantencion registrada.
 *
 * Devuelve `[]` si el cliente no tiene dia de mantencion valido: sin dia no hay
 * nada que proyectar, y es preferible no mostrar nada a inventar un dia.
 */
export const proyectarVisitasDelMes = ({
  diaMantencion,
  frecuencia,
  ancla,
  mes,
  registradas = [],
}: ParametrosProyeccion): Date[] => {
  const diaObjetivo = DIAS[normalizar(diaMantencion)];
  if (!diaObjetivo) return [];

  const inicioMes = DateTime.fromISO(`${mes}-01`);
  if (!inicioMes.isValid) return [];
  const finMes = inicioMes.endOf("month");

  // Sin ancla utilizable se toma el propio mes: la periodicidad sigue
  // ordenando las visitas dentro del mes aunque el ciclo no tenga origen.
  const base = alinearAlDia(aDateTime(ancla) ?? inicioMes, diaObjetivo);
  const nombreFrecuencia = normalizar(frecuencia);

  let fechas: DateTime[];

  if (nombreFrecuencia === "mensual") {
    const ordinal = Math.ceil(base.day / 7);
    fechas = [visitaMensual(inicioMes, diaObjetivo, ordinal)];
  } else {
    const paso = PASO_DIAS[nombreFrecuencia] ?? PASO_DIAS.semanal;
    // Se salta de una a la vecindad del mes en un solo calculo en vez de
    // iterar desde el ancla: el ancla puede estar a anios del mes que se esta
    // mirando (un cliente antiguo abriendo un mes reciente, o al reves).
    const saltos = Math.floor(inicioMes.diff(base, "days").days / paso);
    let cursor = base.plus({ days: saltos * paso });
    while (cursor < inicioMes) cursor = cursor.plus({ days: paso });

    fechas = [];
    while (cursor <= finMes) {
      fechas.push(cursor);
      cursor = cursor.plus({ days: paso });
    }
  }

  const yaRegistradas = new Set(
    registradas
      .map((fecha) => aDateTime(fecha)?.toISODate())
      .filter((fecha): fecha is string => Boolean(fecha)),
  );

  return fechas
    .filter((fecha) => !yaRegistradas.has(fecha.toISODate() ?? ""))
    .map((fecha) => fecha.toJSDate());
};

/**
 * Ancla del ciclo: la mantencion mas reciente del cliente, o `fecha_ingreso`
 * si todavia no tiene ninguna.
 */
export const anclaDelCiclo = (
  fechasMantenciones: (string | Date)[],
  fechaIngreso?: string | Date | null,
): string | Date | null => {
  const ultima = fechasMantenciones
    .map((fecha) => aDateTime(fecha))
    .filter((fecha): fecha is DateTime => fecha !== null)
    .sort((a, b) => b.toMillis() - a.toMillis())[0];

  return ultima ? ultima.toJSDate() : (fechaIngreso ?? null);
};
