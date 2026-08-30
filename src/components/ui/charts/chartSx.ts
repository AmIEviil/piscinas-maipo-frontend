import type { SxProps, Theme } from "@mui/material";
import type { VizPalette } from "./chartPalette";

/**
 * Tinta de un grafico de MUI X sobre la superficie de las tarjetas del Home.
 *
 * Por defecto los ejes y la leyenda de MUI toman el color de texto del tema,
 * pensado para fondo de pagina. Las tarjetas de grafico se pintan sobre
 * --color-gris-oscuro, que es el inverso, asi que sin esto los ejes quedan
 * casi invisibles.
 *
 * La rejilla y los ejes van deliberadamente por detras del dato: son referencia,
 * no contenido.
 */
export const buildChartSx = (palette: VizPalette): SxProps<Theme> => ({
  "& .MuiChartsAxis-tickLabel": {
    fill: `${palette.inkMuted} !important`,
  },
  "& .MuiChartsAxis-label": {
    fill: `${palette.ink} !important`,
  },
  "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
    stroke: `${palette.grid} !important`,
  },
  "& .MuiChartsGrid-line": {
    stroke: palette.grid,
    strokeOpacity: 0.5,
  },
  // Etiquetas directas sobre las barras: son la compensacion obligatoria para
  // las ranuras de color que no llegan a 3:1 de contraste contra la superficie.
  "& .MuiBarLabel-root": {
    fill: `${palette.ink} !important`,
    fontWeight: 700,
  },
  // La leyenda de la version 8 es HTML, no SVG: lleva color, no fill.
  "& .MuiChartsLegend-label": {
    color: palette.ink,
  },
  "& .MuiChartsLegend-root": {
    color: palette.ink,
  },
});
