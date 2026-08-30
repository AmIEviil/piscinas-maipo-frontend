import { useCallback, useEffect, useRef, useState } from "react";

interface UseHideOnScrollOptions {
  /** Scroll minimo antes de permitir que la barra se esconda. */
  threshold?: number;
  /** Movimiento minimo entre lecturas para cambiar de estado. Evita el
   *  parpadeo del rebote elastico y de los scrolls de un par de pixeles. */
  delta?: number;
}

/**
 * Esconde un elemento fijo cuando el usuario baja y lo devuelve cuando sube.
 * La lectura del scroll se hace dentro de requestAnimationFrame para no
 * forzar un reflow por cada evento: el listener solo agenda, el frame mide.
 */
export const useHideOnScroll = ({
  threshold = 80,
  delta = 6,
}: UseHideOnScrollOptions = {}) => {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const isTicking = useRef(false);

  const reveal = useCallback(() => {
    lastScrollY.current = window.scrollY;
    setIsHidden(false);
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const evaluate = () => {
      isTicking.current = false;
      const currentY = Math.max(window.scrollY, 0);
      const difference = currentY - lastScrollY.current;

      // Arriba del todo la barra siempre esta visible, sin importar la
      // direccion: es donde el usuario espera encontrarla.
      if (currentY <= threshold) {
        lastScrollY.current = currentY;
        setIsHidden(false);
        return;
      }

      if (Math.abs(difference) < delta) return;

      lastScrollY.current = currentY;
      setIsHidden(difference > 0);
    };

    const handleScroll = () => {
      if (isTicking.current) return;
      isTicking.current = true;
      requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, delta]);

  return { isHidden, reveal };
};
