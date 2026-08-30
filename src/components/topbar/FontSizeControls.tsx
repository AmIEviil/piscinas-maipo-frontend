import style from "./FontSizeControls.module.css";
import { useBoundStore } from "../../store/BoundedStore";
import {
  FONT_SCALE_STEPS,
  MAX_FONT_SCALE_LEVEL,
  MIN_FONT_SCALE_LEVEL,
} from "../../store/A11yStore";

/**
 * Control de tamano de letra del TopBar.
 *
 * Va siempre visible y no dentro de un menu: el publico de la aplicacion son
 * adultos mayores, y una opcion escondida en un desplegable no la encuentran.
 */
export const FontSizeControls = () => {
  const fontScaleLevel = useBoundStore((state) => state.fontScaleLevel);
  const increaseFont = useBoundStore((state) => state.increaseFont);
  const decreaseFont = useBoundStore((state) => state.decreaseFont);

  const atMin = fontScaleLevel <= MIN_FONT_SCALE_LEVEL;
  const atMax = fontScaleLevel >= MAX_FONT_SCALE_LEVEL;
  const totalLevels = FONT_SCALE_STEPS.length;

  return (
    <div
      className={style.fontSizeControls}
      role="group"
      aria-label="Tamaño de letra"
    >
      <span className={style.label}>Letra</span>

      <button
        type="button"
        className={style.button}
        onClick={decreaseFont}
        disabled={atMin}
        aria-label="Reducir tamaño de letra"
        title="Reducir tamaño de letra"
      >
        <span className={style.decreaseGlyph} aria-hidden="true">
          A−
        </span>
      </button>

      <span
        className={style.levelIndicator}
        aria-live="polite"
        aria-label={`Nivel ${fontScaleLevel + 1} de ${totalLevels}`}
      >
        {FONT_SCALE_STEPS.map((_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`${style.dot} ${
              index <= fontScaleLevel ? style.dotActive : ""
            }`}
          />
        ))}
      </span>

      <button
        type="button"
        className={style.button}
        onClick={increaseFont}
        disabled={atMax}
        aria-label="Aumentar tamaño de letra"
        title="Aumentar tamaño de letra"
      >
        <span className={style.increaseGlyph} aria-hidden="true">
          A+
        </span>
      </button>
    </div>
  );
};

export default FontSizeControls;
