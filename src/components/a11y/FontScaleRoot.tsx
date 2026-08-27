import { type ReactNode } from "react";
import { useFontScale } from "../../hooks/useFontScale";

/**
 * Envuelve toda la aplicacion para que la preferencia de tamano de letra rija
 * tambien fuera de BodyLayout, es decir en /login y en recuperar contrasena.
 */
export const FontScaleRoot = ({ children }: { children: ReactNode }) => {
  useFontScale();
  return <>{children}</>;
};

export default FontScaleRoot;
