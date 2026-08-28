import { useEffect, useMemo, useState } from "react";
import type { IMaintenance } from "../../../../service/maintenance.interface";
import { formatMonthTitle } from "../../../../utils/DateUtils";

export interface MesDisponible {
  /** Formato "YYYY-MM". */
  clave: string;
  etiqueta: string;
  totalVisitas: number;
  realizadas: number;
}

/**
 * Estado del mes activo, compartido por las pestanas Mantenciones y Cobros.
 *
 * Los meses salen de las claves de `maintenancesClient`, que el backend ya
 * entrega agrupadas. Se normaliza el mes a dos digitos porque las claves
 * llegan indistintamente como "2026-8" y "2026-08", y sin eso el orden
 * alfabetico las desordena.
 */
export function useMonthNavigation(
  maintenancesClient?: Record<string, IMaintenance[]>,
) {
  const meses = useMemo<MesDisponible[]>(() => {
    if (!maintenancesClient) return [];

    return Object.entries(maintenancesClient)
      .filter(([, lista]) => Array.isArray(lista) && lista.length > 0)
      // Descarta claves que no vengan como "anio-mes" (p. ej. "2026" sin
      // guion, o vacias): sin esto, el destructure de mas abajo revienta el
      // render entero dentro de este useMemo.
      .filter(([clave]) => /^\d{4}-\d{1,2}$/.test(clave))
      .map(([clave, lista]) => {
        const [anio, mes] = clave.split("-");
        const normalizada = `${anio}-${mes.padStart(2, "0")}`;
        return {
          clave: normalizada,
          etiqueta: formatMonthTitle(normalizada),
          totalVisitas: lista.length,
          realizadas: lista.filter((m) => m.realizada).length,
        };
      })
      .sort((a, b) => a.clave.localeCompare(b.clave));
  }, [maintenancesClient]);

  const [mesActivo, setMesActivo] = useState<string | null>(null);

  // Al cargar o cambiar de cliente, se posiciona en el mes mas reciente.
  useEffect(() => {
    if (meses.length === 0) {
      setMesActivo(null);
      return;
    }
    const ultimo = meses[meses.length - 1].clave;
    setMesActivo((actual) =>
      actual && meses.some((m) => m.clave === actual) ? actual : ultimo,
    );
  }, [meses]);

  return { meses, mesActivo, setMesActivo };
}
