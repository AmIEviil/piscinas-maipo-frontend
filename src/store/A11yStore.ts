import { type StateCreator } from "zustand";

/**
 * Niveles de tamano de letra. El valor es el font-size que se aplica al
 * elemento <html>; como MUI, Tailwind y Bootstrap dimensionan en rem, ese
 * unico cambio reescala tipografia, espaciado e iconos de las tres.
 *
 * 100% = 16px, 150% = 24px.
 */
export const FONT_SCALE_STEPS = [100, 112.5, 125, 137.5, 150] as const;

export const MIN_FONT_SCALE_LEVEL = 0;
export const MAX_FONT_SCALE_LEVEL = FONT_SCALE_STEPS.length - 1;
export const DEFAULT_FONT_SCALE_LEVEL = 0;

/**
 * El nivel vive en su propia clave, fuera del bound store: es una preferencia
 * de accesibilidad del dispositivo, no de la sesion, y el logout limpia el
 * almacenamiento de la sesion. Un usuario que necesita letra grande no deberia
 * tener que volver a subirla cada vez que cierra sesion.
 *
 * index.html lee esta misma clave antes del primer render para evitar que la
 * pagina aparezca en tamano normal y salte al tamano elegido.
 */
export const FONT_SCALE_STORAGE_KEY = "piscinas-font-scale-level";

export const clampFontScaleLevel = (level: number): number => {
  if (!Number.isFinite(level)) return DEFAULT_FONT_SCALE_LEVEL;
  return Math.min(
    MAX_FONT_SCALE_LEVEL,
    Math.max(MIN_FONT_SCALE_LEVEL, Math.round(level))
  );
};

const readStoredFontScaleLevel = (): number => {
  try {
    const raw = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    if (raw === null) return DEFAULT_FONT_SCALE_LEVEL;
    return clampFontScaleLevel(Number(raw));
  } catch {
    return DEFAULT_FONT_SCALE_LEVEL;
  }
};

const writeStoredFontScaleLevel = (level: number): void => {
  try {
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(level));
  } catch {
    // Modo privado o almacenamiento lleno: la preferencia solo dura la sesion.
  }
};

export interface A11ySlice {
  fontScaleLevel: number;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  setFontScaleLevel: (level: number) => void;
}

export const createA11ySlice: StateCreator<A11ySlice> = (set) => {
  const commit = (level: number) => {
    const next = clampFontScaleLevel(level);
    writeStoredFontScaleLevel(next);
    set({ fontScaleLevel: next });
  };

  return {
    fontScaleLevel: readStoredFontScaleLevel(),
    increaseFont: () =>
      set((state) => {
        const next = clampFontScaleLevel(state.fontScaleLevel + 1);
        writeStoredFontScaleLevel(next);
        return { fontScaleLevel: next };
      }),
    decreaseFont: () =>
      set((state) => {
        const next = clampFontScaleLevel(state.fontScaleLevel - 1);
        writeStoredFontScaleLevel(next);
        return { fontScaleLevel: next };
      }),
    resetFont: () => commit(DEFAULT_FONT_SCALE_LEVEL),
    setFontScaleLevel: (level) => commit(level),
  };
};
