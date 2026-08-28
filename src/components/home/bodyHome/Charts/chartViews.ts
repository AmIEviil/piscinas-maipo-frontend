import { useCallback, useState } from "react";

/** Las cuatro formas de leer el mismo dato en el Home. */
export type ChartView = "medidores" | "barras" | "dona" | "tabla";

export interface ChartViewOption {
  value: ChartView;
  label: string;
  /** Que responde esta vista, para el title del boton. */
  descripcion: string;
}

export const CHART_VIEW_OPTIONS: ChartViewOption[] = [
  {
    value: "medidores",
    label: "Medidores",
    descripcion: "Un medidor por cada elemento, con sus acciones",
  },
  {
    value: "barras",
    label: "Barras",
    descripcion: "Todos los elementos comparados en un solo grafico",
  },
  {
    value: "dona",
    label: "Reparto",
    descripcion: "Como se reparte el total entre los elementos",
  },
  {
    value: "tabla",
    label: "Tabla",
    descripcion: "Los numeros tal cual, sin interpretar",
  },
];

const esChartView = (valor: unknown): valor is ChartView =>
  CHART_VIEW_OPTIONS.some((opcion) => opcion.value === valor);

/**
 * Recuerda la vista elegida entre visitas. Se guarda en localStorage y no en el
 * store persistido para no ensuciar el estado de negocio con una preferencia de
 * presentacion; si el navegador la bloquea, la vista simplemente vuelve al
 * valor por defecto.
 */
export const useChartView = (
  storageKey: string,
  porDefecto: ChartView = "medidores"
): [ChartView, (vista: ChartView) => void] => {
  const [vista, setVistaState] = useState<ChartView>(() => {
    try {
      const guardada = localStorage.getItem(storageKey);
      return esChartView(guardada) ? guardada : porDefecto;
    } catch {
      return porDefecto;
    }
  });

  const setVista = useCallback(
    (nueva: ChartView) => {
      setVistaState(nueva);
      try {
        localStorage.setItem(storageKey, nueva);
      } catch {
        // Modo privado o almacenamiento lleno: la eleccion vale para esta
        // sesion y no se recuerda. No es motivo para romper la vista.
      }
    },
    [storageKey]
  );

  return [vista, setVista];
};
