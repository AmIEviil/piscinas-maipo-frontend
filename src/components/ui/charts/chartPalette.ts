import { useEffect, useState } from "react";

/**
 * Colores de serie de los graficos.
 *
 * Viven en TypeScript y no en CSS porque MUI X Charts recibe el color como
 * prop y lo escribe en el atributo `fill` del SVG, donde una var() de CSS no
 * se resuelve de forma fiable en todos los navegadores.
 *
 * Las tarjetas de grafico se pintan sobre --color-gris-oscuro, que es el
 * inverso del fondo de pagina: con el tema claro la superficie es #2b2b2b y
 * con el tema oscuro es #e9e9e9. De ahi que los nombres se refieran a la
 * SUPERFICIE del grafico y no al tema de la aplicacion.
 *
 * Los dos juegos son los mismos ocho tonos, escalonados para su superficie.
 * Validados como paleta categorica contra la superficie real:
 *
 *   sobre #2b2b2b  peor par adyacente dE 8.4 (daltonismo) / 19.3 (vision normal)
 *   sobre #e9e9e9  peor par adyacente dE 9.1 (daltonismo) / 19.6 (vision normal)
 *
 * El ORDEN de las ranuras es el mecanismo de seguridad, no una decision
 * estetica: se asignan siempre en orden y nunca se ciclan. Una novena serie no
 * genera un tono nuevo, se agrupa en "Otros".
 */
const SERIES_ON_DARK_SURFACE = [
  "#3987e5", // azul
  "#d95926", // naranja
  "#199e70", // aguamarina
  "#c98500", // amarillo
  "#d55181", // magenta
  "#008300", // verde
  "#9085e9", // violeta
  "#e66767", // rojo
] as const;

const SERIES_ON_LIGHT_SURFACE = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948",
] as const;

/** Cuantas categorias se dibujan antes de agrupar el resto en "Otros". */
export const MAX_SERIES_SLOTS = SERIES_ON_DARK_SURFACE.length;

export interface VizPalette {
  /** Colores de serie en orden fijo, listos para pasar a MUI X Charts. */
  series: readonly string[];
  /** Tinta principal sobre la superficie del grafico. */
  ink: string;
  /** Tinta de ejes y etiquetas secundarias. */
  inkMuted: string;
  /** Rejilla, siempre por detras del dato. */
  grid: string;
}

const PALETTE_ON_DARK_SURFACE: VizPalette = {
  series: SERIES_ON_DARK_SURFACE,
  ink: "#ffffff",
  inkMuted: "#c3c2b7",
  grid: "#4a4a4a",
};

const PALETTE_ON_LIGHT_SURFACE: VizPalette = {
  series: SERIES_ON_LIGHT_SURFACE,
  ink: "#0b0b0b",
  inkMuted: "#52514e",
  grid: "#c9c9c9",
};

const leerTema = (): string => {
  if (typeof document === "undefined") return "light";
  const conTema = document.querySelector("[data-theme]");
  return conTema?.getAttribute("data-theme") ?? "light";
};

/**
 * Devuelve la paleta que corresponde a la superficie sobre la que se dibuja.
 * Con el tema oscuro la tarjeta pasa a fondo claro, asi que la paleta se
 * invierte respecto del tema.
 */
export const useVizPalette = (): VizPalette => {
  const [tema, setTema] = useState(leerTema);

  useEffect(() => {
    const conTema = document.querySelector("[data-theme]");
    if (!conTema) return;

    const observer = new MutationObserver(() => setTema(leerTema()));
    observer.observe(conTema, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return tema === "dark" ? PALETTE_ON_LIGHT_SURFACE : PALETTE_ON_DARK_SURFACE;
};
