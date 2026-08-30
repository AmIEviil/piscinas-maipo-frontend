import { useCallback, useEffect, useRef, useState } from "react";
import type { IProducto } from "../service/products.interface";
import { useLowStockProducts } from "./ProductHooks";
import { useDailyMetrics } from "./MetricsHooks";
import {
  esHoraDeAvisarMantenciones,
  getDiaHabilActual,
} from "../utils/homeAlertsUtils";

/**
 * Primero lo que ya esta en cero (no se puede usar en una mantencion) y
 * despues lo que esta bajo el minimo, del mas escaso al menos escaso.
 */
const ordenarPorCriticidad = (productos: IProducto[]): IProducto[] =>
  [...productos].sort((a, b) => a.cant_disponible - b.cant_disponible);

export interface HomeAlertsData {
  /** Productos agotados o con cant_disponible <= stock_minimo. */
  lowStockProducts: IProducto[];
  /** Dia habil de hoy con el texto del backend, o null si es fin de semana. */
  diaActual: string | null;
  /** Mantenciones del dia de hoy que siguen sin cargarse. */
  mantencionesFaltantes: number;
  /** True mientras se resuelven las dos consultas del montaje. */
  loading: boolean;
  /** Vuelve a pedir el stock bajo (se usa despues de ingresar stock). */
  refetchLowStock: () => Promise<IProducto[]>;
}

/**
 * Datos que alimentan las alertas del Home. Se consultan una sola vez al
 * montar la vista; la metrica diaria solo se pide si realmente puede disparar
 * la alerta (dia habil y despues de la hora de corte), para no gastar una
 * llamada de mas el resto del dia.
 */
export const useHomeAlertsData = (): HomeAlertsData => {
  const lowStockMutation = useLowStockProducts();
  const dailyMetricsMutation = useDailyMetrics();

  const [lowStockProducts, setLowStockProducts] = useState<IProducto[]>([]);
  const [mantencionesFaltantes, setMantencionesFaltantes] = useState(0);
  const [loading, setLoading] = useState(true);

  const diaActual = getDiaHabilActual();
  const enHorarioDeAviso = esHoraDeAvisarMantenciones();

  // Las mutations de react-query se recrean en cada render; guardar mutateAsync
  // en refs deja los efectos con dependencias estables.
  const lowStockRef = useRef(lowStockMutation.mutateAsync);
  lowStockRef.current = lowStockMutation.mutateAsync;
  const dailyMetricsRef = useRef(dailyMetricsMutation.mutateAsync);
  dailyMetricsRef.current = dailyMetricsMutation.mutateAsync;

  const refetchLowStock = useCallback(async () => {
    try {
      const productos = await lowStockRef.current();
      const ordenados = ordenarPorCriticidad(productos ?? []);
      setLowStockProducts(ordenados);
      return ordenados;
    } catch (error) {
      console.error("Error obteniendo productos con stock bajo:", error);
      setLowStockProducts([]);
      return [];
    }
  }, []);

  const fetchMantencionesFaltantes = useCallback(async (dia: string) => {
    try {
      const metricas = await dailyMetricsRef.current();
      const metricaDelDia = metricas?.find((metrica) => metrica.dia === dia);
      setMantencionesFaltantes(metricaDelDia?.faltantes ?? 0);
    } catch (error) {
      console.error("Error obteniendo las mantenciones del dia:", error);
      setMantencionesFaltantes(0);
    }
  }, []);

  // En StrictMode el efecto de montaje corre dos veces: el ref evita la
  // segunda tanda de peticiones.
  const yaConsultado = useRef(false);

  useEffect(() => {
    if (yaConsultado.current) return;
    yaConsultado.current = true;

    const consultar = async () => {
      const tareas: Promise<unknown>[] = [refetchLowStock()];
      if (diaActual && enHorarioDeAviso) {
        tareas.push(fetchMantencionesFaltantes(diaActual));
      }
      await Promise.all(tareas);
      setLoading(false);
    };

    consultar();
  }, [diaActual, enHorarioDeAviso, fetchMantencionesFaltantes, refetchLowStock]);

  return {
    lowStockProducts,
    diaActual,
    mantencionesFaltantes,
    loading,
    refetchLowStock,
  };
};
