import type { IMaintenance } from "../../../../service/maintenance.interface";
import MaintenanceTimelineItem from "./MaintenanceTimelineItem";
import style from "./MaintenanceTimeline.module.css";

interface MaintenanceTimelineProps {
  mantenciones: IMaintenance[];
  /** Siguiente visita esperada segun el dia de mantencion del cliente. */
  proximaVisita: Date | null;
  onEditar: (m: IMaintenance) => void;
  onEliminar: (m: IMaintenance) => void;
  onRegistrarProxima: () => void;
  puedeEliminar: boolean;
}

const MaintenanceTimeline = ({
  mantenciones,
  proximaVisita,
  onEditar,
  onEliminar,
  onRegistrarProxima,
  puedeEliminar,
}: MaintenanceTimelineProps) => {
  if (mantenciones.length === 0 && !proximaVisita) {
    return <p className={style.vacio}>No hay mantenciones registradas en este mes.</p>;
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

      {proximaVisita && (
        <div className={`${style.nodo} ${style.nodoFuturo}`}>
          <article className={style.visita}>
            <div className={style.visitaTop}>
              <span className={style.visitaDia}>
                {proximaVisita.toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className={style.visitaFecha}>proxima visita</span>
            </div>
            <div className={style.estados}>
              <span className={style.estado}>Aun no registrada</span>
            </div>
            <div>
              <button
                type="button"
                className={style.botonPrimario}
                onClick={onRegistrarProxima}
              >
                Registrar esta visita
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTimeline;
