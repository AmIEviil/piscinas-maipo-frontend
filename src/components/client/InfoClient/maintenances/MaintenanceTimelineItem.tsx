import type { IMaintenance } from "../../../../service/maintenance.interface";
import { formatDateToDDMMYYYY } from "../../../../utils/DateUtils";
import style from "./MaintenanceTimeline.module.css";

interface MaintenanceTimelineItemProps {
  mantencion: IMaintenance;
  onEditar: () => void;
  onEliminar: () => void;
  puedeEliminar: boolean;
}

/** "Martes 5" a partir de una fecha ISO, en español. */
const tituloVisita = (fecha: string | Date) => {
  const d = new Date(`${String(fecha).split("T")[0]}T00:00:00`);
  const dia = d.toLocaleDateString("es-CL", { weekday: "long" });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getDate()}`;
};

/**
 * Una visita de la linea de tiempo.
 *
 * Reemplaza una fila de tabla con una columna por producto de cloro, una
 * columna "Otros" con abreviaciones, y dos columnas de Si/No que se leian
 * igual. Aca el estado es color mas palabra, y los productos llevan su nombre
 * completo.
 */
const MaintenanceTimelineItem = ({
  mantencion,
  onEditar,
  onEliminar,
  puedeEliminar,
}: MaintenanceTimelineItemProps) => {
  const pendiente = !mantencion.realizada;

  return (
    <div
      className={`${style.nodo} ${pendiente ? style.nodoPendiente : ""}`}
      data-testid="visita"
    >
      <article className={style.visita}>
        <div className={style.visitaTop}>
          <span className={style.visitaDia}>
            {tituloVisita(mantencion.fechaMantencion)}
          </span>
          <span className={style.visitaFecha}>
            {formatDateToDDMMYYYY(mantencion.fechaMantencion)}
          </span>
          <div className={style.visitaAcciones}>
            <button type="button" className={style.botonSecundario} onClick={onEditar}>
              Editar
            </button>
            {puedeEliminar && (
              <button type="button" className={style.botonPeligro} onClick={onEliminar}>
                Eliminar
              </button>
            )}
          </div>
        </div>

        <div className={style.estados}>
          <span
            className={`${style.estado} ${
              mantencion.realizada ? style.estadoOk : style.estadoPendiente
            }`}
          >
            {mantencion.realizada ? "✓ Realizada" : "✕ No realizada"}
          </span>
          <span
            className={`${style.estado} ${
              mantencion.recibioPago ? style.estadoPago : style.estadoPendiente
            }`}
          >
            {mantencion.recibioPago ? "$ Pagada" : "$ Sin pago"}
          </span>
        </div>

        {mantencion.productos.length > 0 && (
          <div className={style.productos}>
            {mantencion.productos.map((usado) => (
              <span key={usado.product.id} className={style.producto}>
                {usado.product.nombre} <b>×{usado.cantidad}</b>
              </span>
            ))}
          </div>
        )}

        {mantencion.observaciones && (
          <p className={style.observaciones}>{mantencion.observaciones}</p>
        )}
      </article>
    </div>
  );
};

export default MaintenanceTimelineItem;
