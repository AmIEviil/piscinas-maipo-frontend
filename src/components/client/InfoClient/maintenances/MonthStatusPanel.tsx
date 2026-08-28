import { useEffect, useMemo } from "react";
import type { IMaintenance } from "../../../../service/maintenance.interface";
import type { ResumenMonth } from "../types";
import { useClientResumenMonthStore } from "../../../../store/ClientStore";
import style from "./MonthStatusPanel.module.css";

interface MonthStatusPanelProps {
  mesActivo: string | null;
  valorMantencion: number;
  mantencionesDelMes: IMaintenance[];
  /** Suma de los comprobantes cargados en el mes. */
  montoPagado: number;
  onGenerarBoleta: () => void;
  puedeGenerarBoleta: boolean;
}

const pesos = (valor: number) => `$${valor.toLocaleString("es-CL")}`;

/**
 * Calculo del resumen del mes.
 *
 * Es el mismo que hacia ResumeMaintenance, movido sin cambios: la boleta
 * depende de que estos totales no varien.
 */
function calcularResumen(
  mantenciones: IMaintenance[],
  valorMantencion: number,
  mes: string,
): ResumenMonth {
  const resumenMateriales: ResumenMonth["resumenMateriales"] = {};
  let totalMantencion = 0;
  let totalProductos = 0;

  for (const mant of mantenciones) {
    if (mant.realizada) totalMantencion += valorMantencion;

    for (const prod of mant.productos) {
      const nombre = prod.product.nombre;
      const valorUnitario = prod.product.valor_unitario;
      const cantidad = prod.cantidad;

      if (resumenMateriales[nombre]) {
        resumenMateriales[nombre].cantidad += cantidad;
        resumenMateriales[nombre].total += valorUnitario * cantidad;
      } else {
        resumenMateriales[nombre] = {
          cantidad,
          valorUnitario,
          total: valorUnitario * cantidad,
        };
      }
      totalProductos += valorUnitario * cantidad;
    }
  }

  return {
    resumenMateriales,
    mes,
    totalMantencion,
    totalProductos,
    granTotal: totalMantencion + totalProductos,
  };
}

const MonthStatusPanel = ({
  mesActivo,
  valorMantencion,
  mantencionesDelMes,
  montoPagado,
  onGenerarBoleta,
  puedeGenerarBoleta,
}: MonthStatusPanelProps) => {
  const setResumenMonth = useClientResumenMonthStore((s) => s.setResumenMonth);

  const resumen = useMemo(
    () => calcularResumen(mantencionesDelMes, valorMantencion, mesActivo ?? ""),
    [mantencionesDelMes, valorMantencion, mesActivo],
  );

  // Contrato con la generacion de boleta: lee el resumen desde este store.
  useEffect(() => {
    if (!mesActivo) return;
    setResumenMonth(resumen);
  }, [mesActivo, resumen, setResumenMonth]);

  const realizadas = mantencionesDelMes.filter((m) => m.realizada).length;
  const total = mantencionesDelMes.length;
  const porcentaje = total > 0 ? Math.round((realizadas / total) * 100) : 0;
  const pendiente = Math.max(0, resumen.granTotal - montoPagado);

  return (
    <section className={style.panel}>
      <h3 className={style.cabecera}>Estado del mes</h3>
      <div className={style.cuerpo}>
        <div className={style.anilloFila}>
          <div
            className={style.anillo}
            style={{ ["--avance" as string]: `${porcentaje}%` }}
            role="img"
            aria-label={`${realizadas} de ${total} visitas realizadas`}
          >
            <div className={style.anilloCentro}>
              <span className={style.anilloNumero}>
                {realizadas}/{total}
              </span>
              <span className={style.anilloTexto}>visitas</span>
            </div>
          </div>
          <p className={style.anilloDetalle}>
            <b>
              {total - realizadas === 0
                ? "Mes completo"
                : `Falta${total - realizadas > 1 ? "n" : ""} ${total - realizadas} visita${
                    total - realizadas > 1 ? "s" : ""
                  }`}
            </b>
          </p>
        </div>

        <div className={style.montos}>
          <div className={style.monto}>
            <span>Mantenciones ({realizadas})</span>
            <span>{pesos(resumen.totalMantencion)}</span>
          </div>
          <div className={style.monto}>
            <span>Productos</span>
            <span>{pesos(resumen.totalProductos)}</span>
          </div>
          <div className={`${style.monto} ${style.montoTotal}`}>
            <span>Total del mes</span>
            <span>{pesos(resumen.granTotal)}</span>
          </div>
          <div className={style.monto}>
            <span>Ya pagado</span>
            <span>{pesos(montoPagado)}</span>
          </div>
          <div className={`${style.monto} ${style.montoPendiente}`}>
            <span>Pendiente</span>
            <span>{pesos(pendiente)}</span>
          </div>
        </div>

        {Object.keys(resumen.resumenMateriales).length > 0 && (
          <details className={style.desglose}>
            <summary>Ver detalle de productos</summary>
            <div className={style.montos}>
              {Object.entries(resumen.resumenMateriales).map(([nombre, data]) => (
                <div key={nombre} className={style.monto}>
                  <span>
                    {nombre} — {pesos(data.valorUnitario)} × {data.cantidad}
                  </span>
                  <span>{pesos(data.total)}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        {puedeGenerarBoleta && (
          <button type="button" className={style.botonBloque} onClick={onGenerarBoleta}>
            Generar boleta del mes
          </button>
        )}
      </div>
    </section>
  );
};

export default MonthStatusPanel;
