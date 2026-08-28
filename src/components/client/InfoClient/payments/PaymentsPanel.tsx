import type { IComprobantePago } from "../../../../service/ComprobantePagos.interface";
import PaymentCard from "./PaymentCard";
import style from "./PaymentsPanel.module.css";

interface PaymentsPanelProps {
  comprobantes: IComprobantePago[];
  totalMes: number;
  visitasSinPago: { id: string; etiqueta: string; monto: number }[];
  puedeEscribir: boolean;
  onVer: (c: IComprobantePago) => void;
  onEliminar: (id: string) => void;
  onGenerarBoleta: () => void;
  onRegistrarPago: () => void;
}

/**
 * Pestana Cobros.
 *
 * Reemplaza `ComprobantesContainer` (una `TableGeneric` de cinco columnas
 * cuya primera celda medía 450px fijos) por tarjetas que no obligan a
 * arrastrar de lado en celular. Visible para todos los roles: para quien no
 * es superadmin se renderiza completa pero de solo lectura -sin registrar,
 * eliminar ni generar boleta- con un aviso explicito en vez de ocultarse.
 */
const PaymentsPanel = ({
  comprobantes,
  totalMes,
  visitasSinPago,
  puedeEscribir,
  onVer,
  onEliminar,
  onGenerarBoleta,
  onRegistrarPago,
}: PaymentsPanelProps) => {
  const pagado = comprobantes.reduce((suma, c) => suma + (c.monto ?? 0), 0);
  const pendiente = Math.max(0, totalMes - pagado);
  const pesos = (v: number) => `$${v.toLocaleString("es-CL")}`;

  return (
    <>
      {!puedeEscribir && (
        <p className={style.aviso}>
          Solo lectura: puedes consultar los pagos del mes, pero no registrarlos
          ni eliminarlos.
        </p>
      )}

      <div className={style.dosColumnas}>
        <div>
          {comprobantes.length === 0 ? (
            <p className={style.vacio}>No hay pagos registrados en este mes.</p>
          ) : (
            <div className={style.comprobantes}>
              {comprobantes.map((c) => (
                <PaymentCard
                  key={c.id}
                  comprobante={c}
                  puedeEliminar={puedeEscribir}
                  onVer={() => onVer(c)}
                  onEliminar={() => onEliminar(c.id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className={style.columnaLado}>
          <section className={style.panelLado}>
            <h3 className={style.panelLadoCab}>Cobranza del mes</h3>
            <div className={style.panelLadoCuerpo}>
              <div className={style.monto}>
                <span>Total del mes</span>
                <span>{pesos(totalMes)}</span>
              </div>
              <div className={style.monto}>
                <span>Ya pagado</span>
                <span>{pesos(pagado)}</span>
              </div>
              <div className={`${style.monto} ${style.montoPendiente}`}>
                <span>Pendiente</span>
                <span>{pesos(pendiente)}</span>
              </div>

              {visitasSinPago.length > 0 && (
                <div>
                  <h4 className={style.subtitulo}>Visitas sin pago</h4>
                  <div className={style.pendientes}>
                    {visitasSinPago.map((v) => (
                      <div key={v.id} className={style.pendiente}>
                        {v.etiqueta} <b>{pesos(v.monto)}</b>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {puedeEscribir && (
                <>
                  <button type="button" className={style.botonBloque} onClick={onRegistrarPago}>
                    Registrar un pago
                  </button>
                  <button
                    type="button"
                    className={style.botonBloqueSecundario}
                    onClick={onGenerarBoleta}
                  >
                    Generar boleta del mes
                  </button>
                </>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default PaymentsPanel;
