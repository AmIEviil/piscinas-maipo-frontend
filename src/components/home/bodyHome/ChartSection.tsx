import type { ReactNode } from "react";
import { CircularProgress } from "@mui/material";
import ChartViewToggle from "./Charts/ChartViewToggle";
import type { ChartView } from "./Charts/chartViews";
import style from "./BodyHome.module.css";

interface ChartSectionProps {
  titulo: string;
  vista: ChartView;
  onVistaChange: (vista: ChartView) => void;
  loading: boolean;
  /** Mensaje del fallo, o null si la carga salio bien. */
  error: string | null;
  onReintentar: () => void;
  /** True cuando la consulta respondio pero no trajo nada que mostrar. */
  vacio: boolean;
  mensajeVacio: string;
  children: ReactNode;
}

/**
 * Marco comun de las dos secciones del Home: titulo, selector de vista y el
 * contenido, con los tres estados que antes faltaban.
 *
 * Antes un fallo de red solo llegaba a un console.log: el spinner se quedaba
 * girando para siempre y no habia forma de reintentar sin recargar la pagina.
 */
const ChartSection = ({
  titulo,
  vista,
  onVistaChange,
  loading,
  error,
  onReintentar,
  vacio,
  mensajeVacio,
  children,
}: ChartSectionProps) => (
  <section className={style.chartsHomeContainer} aria-label={titulo}>
    <div className={style.sectionHeader}>
      <h2 className={style.titleChart}>{titulo}</h2>
      <ChartViewToggle
        value={vista}
        onChange={onVistaChange}
        etiquetaGrupo={titulo}
      />
    </div>

    <div
      className={`${style.sectionBody} ${
        vista === "medidores" ? style.sectionBodyCards : ""
      } custom-scrollbar`}
    >
      {loading ? (
        <div className={style.stateBox} role="status">
          <CircularProgress />
          <span>Cargando {titulo.toLowerCase()}…</span>
        </div>
      ) : error ? (
        <div className={style.stateBox} role="alert">
          <p className={style.stateMessage}>{error}</p>
          <button
            type="button"
            className={style.retryButton}
            onClick={onReintentar}
          >
            Reintentar
          </button>
        </div>
      ) : vacio ? (
        <p className={`${style.stateBox} ${style.stateMessage}`}>
          {mensajeVacio}
        </p>
      ) : (
        children
      )}
    </div>
  </section>
);

export default ChartSection;
