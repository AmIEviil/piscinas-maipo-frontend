import type { IComprobantePago } from "../../../../service/ComprobantePagos.interface";
import { toUpperCaseFirstLetter } from "../../../../utils/formatTextUtils";
import { formatDateToDDMMYYYY } from "../../../../utils/DateUtils";
import style from "./PaymentsPanel.module.css";

interface PaymentCardProps {
  comprobante: IComprobantePago;
  puedeEliminar: boolean;
  onVer: () => void;
  onEliminar: () => void;
}

/**
 * Un comprobante de pago.
 *
 * Reemplaza una fila de una tabla de cinco columnas cuya primera celda medía
 * 450px fijos, lo que en celular obligaba a arrastrar de lado para llegar a
 * los botones.
 */
const PaymentCard = ({
  comprobante,
  puedeEliminar,
  onVer,
  onEliminar,
}: PaymentCardProps) => (
  <article className={style.comprobante}>
    <div className={style.comprobanteTop}>
      <div>
        <div className={style.comprobanteNombre}>
          {toUpperCaseFirstLetter(comprobante.nombre)}
        </div>
        <div className={style.comprobanteMeta}>
          {formatDateToDDMMYYYY(comprobante.fecha_emision)}
          {comprobante.fileInfo?.mimeType &&
            ` · ${comprobante.fileInfo.mimeType.split("/")[1]?.toUpperCase()}`}
        </div>
      </div>
      <div className={style.comprobanteMonto}>
        {new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          minimumFractionDigits: 0,
        }).format(comprobante.monto ?? 0)}
      </div>
    </div>

    {comprobante.mantenciones && comprobante.mantenciones.length > 0 && (
      <div className={style.cubre}>
        {comprobante.mantenciones.map((m) => (
          <span key={m.id} className={style.cubreItem}>
            Cubre la visita del <b>{formatDateToDDMMYYYY(m.fechaMantencion)}</b>
          </span>
        ))}
      </div>
    )}

    <div className={style.comprobanteAcciones}>
      {/* fileInfo tambien se exige aca (no solo viewUrl): el kind que arma
          InfoDialogClient.mapComprobantePago para MediaVisualizer sale de
          fileInfo.mimeType, asi que sin fileInfo la vista previa cae al
          branch "other" -> un iframe vacio. Sin este chequeo, un comprobante
          con viewUrl pero sin fileInfo (subida a medio procesar) mostraria
          un boton Ver que no muestra nada. */}
      {comprobante.viewUrl && comprobante.fileInfo && (
        <button type="button" className={style.botonSecundario} onClick={onVer}>
          Ver
        </button>
      )}
      {comprobante.fileInfo?.driveUrl && (
        <a
          className={style.botonFantasma}
          href={comprobante.fileInfo.driveUrl}
          target="_blank"
          rel="noreferrer"
        >
          Descargar
        </a>
      )}
      {puedeEliminar && (
        <button type="button" className={style.botonPeligro} onClick={onEliminar}>
          Eliminar
        </button>
      )}
    </div>
  </article>
);

export default PaymentCard;
