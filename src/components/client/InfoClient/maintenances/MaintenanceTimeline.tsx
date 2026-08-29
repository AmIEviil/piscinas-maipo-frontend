import type { IMaintenance } from "../../../../service/maintenance.interface";
import MaintenanceTimelineItem from "./MaintenanceTimelineItem";
import style from "./MaintenanceTimeline.module.css";

interface MaintenanceTimelineProps {
  mantenciones: IMaintenance[];
  /**
   * Visitas que tocan en el mes segun la periodicidad del cliente y que
   * todavia no tienen mantencion registrada, ordenadas.
   */
  visitasProyectadas: Date[];
  onEditar: (m: IMaintenance) => void;
  onEliminar: (m: IMaintenance) => void;
  /** Abre la hoja de registro con la fecha de esa visita ya puesta. */
  onRegistrarVisita: (fecha: Date) => void;
  puedeEliminar: boolean;
}

const etiquetaVisita = (fecha: Date) =>
  fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/**
 * Linea de tiempo del mes: las mantenciones ya registradas y, detras de
 * ellas, las visitas que la periodicidad del cliente proyecta para el mismo
 * mes.
 *
 * Antes se mostraba un unico nodo futuro calculado como "el proximo dia de la
 * semana que coincide con dia_mantencion", lo que daba por hecho que todos
 * los clientes eran semanales. A un cliente mensual le anunciaba una visita
 * tres semanas antes de tiempo.
 */
const MaintenanceTimeline = ({
  mantenciones,
  visitasProyectadas,
  onEditar,
  onEliminar,
  onRegistrarVisita,
  puedeEliminar,
}: MaintenanceTimelineProps) => {
  if (mantenciones.length === 0 && visitasProyectadas.length === 0) {
    return (
      <p className={style.vacio}>No hay mantenciones registradas en este mes.</p>
    );
  }

  return (
    <div className={style.linea}>
      {mantenciones.map((mantencion) => (
        <MaintenanceTimelineItem
          key={mantencion.id}
          mantencion={mantencion}
          onEditar={() => onEditar(mantencion)}
          onEliminar={() => onEliminar(mantencion)}
          puedeEliminar={puedeEliminar}
        />
      ))}

      {visitasProyectadas.map((visita) => (
        <div
          key={visita.toISOString()}
          className={`${style.nodo} ${style.nodoFuturo}`}
          data-testid="visita-proyectada"
        >
          <article className={style.visita}>
            <div className={style.visitaTop}>
              <span className={style.visitaDia}>{etiquetaVisita(visita)}</span>
              <span className={style.visitaFecha}>visita programada</span>
            </div>
            <div className={style.estados}>
              <span className={style.estado}>Aun no registrada</span>
            </div>
            <div>
              <button
                type="button"
                className={style.botonPrimario}
                onClick={() => onRegistrarVisita(visita)}
              >
                Registrar esta visita
              </button>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceTimeline;
