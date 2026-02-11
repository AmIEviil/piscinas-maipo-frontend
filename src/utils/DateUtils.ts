import { DateTime } from "luxon";

export const formatDateToDDMMYYYY = (dateInput: string | Date): string => {
  // Cuando dateInput es una string como "YYYY-MM-DD" (que es el formato de tu API)
  // New Date() la interpreta como UTC, lo que causa el desplazamiento de -3 horas.
  // Usamos luxon para forzar la interpretación como fecha local, o manejamos el objeto Date.

  if (typeof dateInput === "string") {
    // Si la cadena es 'YYYY-MM-DD', la parseamos sin zona horaria,
    // y Luxon la interpretará como local.
    const luxonDate = DateTime.fromISO(dateInput);
    if (!luxonDate.isValid) return "";
    return luxonDate.toFormat("dd/MM/yyyy");
  }

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    // Si ya es un objeto Date (como el que viene en clientInfo.fecha_ingreso, que puede
    // venir de un DatePicker), usamos Luxon para manejarlo con la zona local.
    const luxonDate = DateTime.fromJSDate(dateInput);
    if (!luxonDate.isValid) return "";
    return luxonDate.toFormat("dd/MM/yyyy");
  }

  return "dd/MM/yyyy";
};

export const formatDateFromTimestamp = (timestamp: number): string => {
  if (!timestamp) return "--/--/----";

  const dateObj = new Date(timestamp);
  if (isNaN(dateObj.getTime())) return "--/--/----";

  return DateTime.fromJSDate(dateObj).toFormat("dd/MM/yyyy");
};

export const formatTimeFromTimestamp = (timestamp: number): string => {
  if (!timestamp) return "--:--";

  const dateObj = new Date(timestamp);
  if (isNaN(dateObj.getTime())) return "--:--";

  return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.TIME_SIMPLE);
};

export const formatMonthTitle = (monthYear: string): string => {
  if (!monthYear) return "";

  // Dividimos la cadena "YYYY-MM" para obtener año y mes numéricos
  // Esto evita cualquier ambigüedad de zona horaria al crear la fecha
  const [year, month] = monthYear.split("-").map(Number);

  // Creamos una fecha Luxon en la zona horaria local para el día 1 del mes a mediodía
  // Usar mediodía (12:00) es una técnica común para evitar problemas de cambio de hora
  const date = DateTime.local(year, month, 1, 12);

  if (!date.isValid) return "";

  // Formateamos: "LLLL" es el nombre completo del mes, "yyyy" el año
  const formatted = date.setLocale("es").toFormat("LLLL yyyy");

  // Capitalizamos la primera letra
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Función para formatear fecha local a string YYYY-MM-DD sin alterar la zona horaria
export const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateTOYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
