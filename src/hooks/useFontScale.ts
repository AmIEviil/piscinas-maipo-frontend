import { useEffect } from "react";
import { useBoundStore } from "../store/BoundedStore";
import { FONT_SCALE_STEPS, clampFontScaleLevel } from "../store/A11yStore";

/**
 * Aplica el nivel de tamano de letra al elemento <html>.
 *
 * Se monta en la raiz de la aplicacion, no dentro de BodyLayout, para que la
 * preferencia valga tambien en /login y en el resto de las pantallas publicas.
 */
export const useFontScale = (): void => {
  const fontScaleLevel = useBoundStore((state) => state.fontScaleLevel);

  useEffect(() => {
    const level = clampFontScaleLevel(fontScaleLevel);
    document.documentElement.style.fontSize = `${FONT_SCALE_STEPS[level]}%`;
    document.documentElement.dataset.fontScale = String(level);
  }, [fontScaleLevel]);
};
