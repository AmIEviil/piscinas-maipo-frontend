import style from "./MonthBar.module.css";
import type { MesDisponible } from "../hooks/useMonthNavigation";

interface MonthBarProps {
  meses: MesDisponible[];
  mesActivo: string | null;
  onCambiarMes: (clave: string) => void;
  etiquetaAccion: string;
  onAccion: () => void;
  mostrarAccion: boolean;
}

/**
 * Carrusel de meses compartido por Mantenciones y Cobros.
 *
 * Vive bajo el tablist, no dentro de los paneles: al cambiar de pestana el mes
 * se conserva. Lo unico que cambia entre pestanas es el boton de la derecha.
 */
const MonthBar = ({
  meses,
  mesActivo,
  onCambiarMes,
  etiquetaAccion,
  onAccion,
  mostrarAccion,
}: MonthBarProps) => {
  if (meses.length === 0 && !mostrarAccion) return null;

  return (
    <div className={style.barra}>
      <div className={style.pista} role="group" aria-label="Elegir mes">
        {meses.map((mes) => {
          const activo = mes.clave === mesActivo;
          return (
            <button
              key={mes.clave}
              type="button"
              className={style.pildora}
              aria-current={activo ? "true" : undefined}
              onClick={() => onCambiarMes(mes.clave)}
            >
              {mes.etiqueta}
              <small>
                {mes.realizadas} de {mes.totalVisitas} hechas
              </small>
            </button>
          );
        })}
      </div>
      {mostrarAccion && (
        <div className={style.accion}>
          <button type="button" className={style.botonAccion} onClick={onAccion}>
            + {etiquetaAccion}
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthBar;
