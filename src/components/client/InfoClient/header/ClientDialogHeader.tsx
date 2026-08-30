import type { IClientForm } from "../types";
import style from "./ClientDialogHeader.module.css";
import { formatCLP } from "../../../../utils/formatTextUtils";

interface ClientDialogHeaderProps {
  clientInfo: IClientForm;
  onCerrar: () => void;
  onGenerarBoleta: () => void;
  onVerReparaciones: () => void;
  puedeGenerarBoleta: boolean;
}

/** Iniciales para el cuadrado de identidad, maximo dos letras. */
const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Cabecera fija del modal.
 *
 * Es la region que resuelve dos problemas a la vez: da color a un modal que
 * era blanco plano, y mantiene el nombre del cliente visible. Antes vivia
 * dentro del area con scroll, asi que al bajar a la tabla se perdia de vista
 * de quien era la ficha.
 */
const ClientDialogHeader = ({
  clientInfo,
  onCerrar,
  onGenerarBoleta,
  onVerReparaciones,
  puedeGenerarBoleta,
}: ClientDialogHeaderProps) => {
  const nombre = String(clientInfo.nombre?.value ?? "");
  const direccion = String(clientInfo.direccion?.value ?? "");
  const comuna = String(clientInfo.comuna?.value ?? "");
  const dia = clientInfo.dia_mantencion?.value;
  const valor = clientInfo.valor_mantencion?.value;
  const ruta = clientInfo.ruta?.value;
  const tipo = clientInfo.tipo_piscina?.value;
  const activo = clientInfo.isActive?.value;

  const consulta = encodeURIComponent(`${direccion}, ${comuna}, Chile`);

  return (
    <header className={style.cabecera}>
      <div className={style.fila}>
        <div className={style.inicial} aria-hidden="true">
          {iniciales(nombre)}
        </div>
        <div className={style.texto}>
          <h2 className={style.nombre}>{nombre}</h2>
          <p className={style.direccion}>
            {[direccion, comuna].filter(Boolean).join(", ")}
          </p>
        </div>
        <button
          type="button"
          className={style.cerrar}
          onClick={onCerrar}
          aria-label="Cerrar la ficha del cliente"
        >
          &#10005;
        </button>
      </div>

      <div className={style.chips}>
        {dia && (
          <span className={style.chip}>
            Mantención los <b>{String(dia).toLowerCase()}</b>
          </span>
        )}
        {valor != null && (
          <span className={style.chip}>
            <b>{formatCLP(valor)}</b> por visita
          </span>
        )}
        {ruta && (
          <span className={style.chip}>
            Ruta <b>{String(ruta)}</b>
          </span>
        )}
        {tipo && (
          <span className={style.chip}>
            Piscina de <b>{String(tipo).toLowerCase()}</b>
          </span>
        )}
        <span className={style.chip}>
          Cliente <b>{activo === false ? "inactivo" : "activo"}</b>
        </span>
      </div>

      <div className={style.acciones}>
        <a
          className={style.botonCabecera}
          href={`https://www.google.com/maps/search/?api=1&query=${consulta}`}
          target="_blank"
          rel="noreferrer"
        >
          Cómo llegar
        </a>
        {puedeGenerarBoleta && (
          <button
            type="button"
            className={style.botonCabecera}
            onClick={onGenerarBoleta}
          >
            Generar boleta
          </button>
        )}
        <button
          type="button"
          className={style.botonCabecera}
          onClick={onVerReparaciones}
        >
          Ver reparaciones
        </button>
      </div>
    </header>
  );
};

export default ClientDialogHeader;
