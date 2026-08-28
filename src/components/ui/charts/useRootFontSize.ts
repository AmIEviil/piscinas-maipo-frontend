import { useEffect, useState } from "react";

const leerTamanoRaiz = (): number => {
  if (typeof window === "undefined") return 16;
  const tamano = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize
  );
  return Number.isFinite(tamano) && tamano > 0 ? tamano : 16;
};

/**
 * Cuantos px mide un rem en este momento.
 *
 * MUI X Charts pide alto y anchos de eje en px, pero el control de tamano de
 * letra del TopBar cambia el font-size del <html>. Sin esto un grafico de 300px
 * se queda en 300px mientras las etiquetas crecen, y terminan pisandose.
 * Multiplicando por este valor las medidas se expresan en rem de verdad.
 */
export const useRootFontSize = (): number => {
  const [tamano, setTamano] = useState(leerTamanoRaiz);

  useEffect(() => {
    const actualizar = () => setTamano(leerTamanoRaiz());
    actualizar();

    // useFontScale escribe el nivel en <html> como estilo y como data-attribute:
    // observar los dos atributos cubre cualquiera de los dos caminos.
    const observer = new MutationObserver(actualizar);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-font-scale"],
    });

    // El navegador tambien puede cambiar el tamano base desde sus ajustes.
    window.addEventListener("resize", actualizar);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  return tamano;
};
