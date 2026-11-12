import { useClientHistory } from "../../../../hooks/ClientHooks";
import {
  etiquetaCampo,
  formatearFechaHistorial,
  formatearValorHistorial,
} from "./historyFormat";
import style from "./HistoryPanel.module.css";

interface HistoryPanelProps {
  clientId: string | undefined;
  /** Solo se pide el historial cuando la pestana esta activa. */
  activo: boolean;
}

/**
 * Pestana Historial: quien cambio que en la ficha del cliente, mas reciente
 * arriba (el backend ya lo entrega ordenado).
 */
const HistoryPanel = ({ clientId, activo }: HistoryPanelProps) => {
  const { data, isLoading, isError } = useClientHistory(clientId, activo);

  if (isLoading) return <p className={style.estado}>Cargando historial...</p>;
  if (isError)
    return (
      <p className={style.error} role="alert">
        No se pudo cargar el historial.
      </p>
    );
  if (!data || data.length === 0)
    return <p className={style.estado}>Aún no hay cambios registrados.</p>;

  return (
    <ol className={style.lista}>
      {data.map((entrada) => (
        <li key={entrada.id} className={style.item}>
          <p className={style.cambio}>
            {entrada.accion === "creado" ? (
              <b>Cliente creado</b>
            ) : (
              <>
                <b>{etiquetaCampo(entrada.campo)}</b>
                <span>
                  {formatearValorHistorial(entrada.campo, entrada.valorAnterior)}
                  {" → "}
                  {formatearValorHistorial(entrada.campo, entrada.valorNuevo)}
                </span>
              </>
            )}
          </p>
          <p className={style.meta}>
            <span>{entrada.usuario ?? "Usuario desconocido"}</span>
            <span aria-hidden="true">·</span>
            <span>{formatearFechaHistorial(entrada.fecha)}</span>
            {entrada.origen === "masivo" && (
              <span className={style.chip}>Cambio masivo</span>
            )}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default HistoryPanel;
