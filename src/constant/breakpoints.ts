/**
 * Breakpoints unicos de la aplicacion.
 *
 * Antes convivian 360, 400, 480, 600, 640, 720, 768, 990, 1000, 1020, 1024,
 * 1280 y 1580 px repartidos entre CSS y comparaciones de window.innerWidth, de
 * modo que un mismo componente cambiaba de forma a un ancho y su contenedor a
 * otro. Estos cuatro valores son los mismos que usan los archivos CSS.
 */
export const BREAKPOINTS = {
  /** Celular */
  mobile: 480,
  /** Tablet y celular en horizontal */
  tablet: 768,
  /** Notebook */
  laptop: 1024,
  /** Escritorio ancho */
  desktop: 1440,
} as const;
