/* eslint-disable react-hooks/exhaustive-deps */
import style from "./ResumeMaintenance.module.css";
import { useEffect, useState } from "react";
import { useClientResumenMonthStore } from "../../../../store/ClientStore";
import type { IMaintenance } from "../../../../service/maintenance.interface";

export interface ResumenMaterial {
  cantidad: number;
  valorUnitario: number;
  total: number;
}

export interface ResumenMonth {
  resumenMateriales: Record<string, ResumenMaterial>;
  mes: string;
  totalMantencion: number;
  totalProductos: number;
  granTotal: number;
}

interface ResumeMaintenanceProps {
  currentMonth: string;
  valor_mantencion: number;
  mantencionesMesActual: IMaintenance[];
}

const ResumeMaintenance = ({
  currentMonth,
  valor_mantencion,
  mantencionesMesActual,
}: ResumeMaintenanceProps) => {
  const setResumenMonthStore = useClientResumenMonthStore(
    (state) => state.setResumenMonth,
  );

  const emptyResumenMonth: ResumenMonth = {
    resumenMateriales: {},
    mes: "",
    totalMantencion: 0,
    totalProductos: 0,
    granTotal: 0,
  };

  const [resumenMonth, setResumenMonth] =
    useState<ResumenMonth>(emptyResumenMonth);

  const calcularResumenMantenciones = (
    mantenciones: IMaintenance[],
    valorMantencion: number,
  ) => {
    const resumenMateriales: Record<
      string,
      { cantidad: number; valorUnitario: number; total: number }
    > = {};

    let totalMantencion = 0;
    let totalProductos = 0;

    for (const mant of mantenciones) {
      if (mant.realizada) {
        totalMantencion += valorMantencion;
      }

      for (const prod of mant.productos) {
        const nombre = prod.product.nombre;
        const valorUnitario = prod.product.valor_unitario;
        const cantidad = prod.cantidad;

        if (resumenMateriales[nombre]) {
          resumenMateriales[nombre].cantidad += cantidad;
          resumenMateriales[nombre].total += valorUnitario * cantidad;
        } else {
          resumenMateriales[nombre] = {
            cantidad: cantidad,
            valorUnitario,
            total: valorUnitario * cantidad,
          };
        }

        totalProductos += valorUnitario * cantidad;
      }
    }

    const granTotal = totalMantencion + totalProductos;

    return {
      resumenMateriales,
      mes: currentMonth ?? "",
      totalMantencion,
      totalProductos,
      granTotal,
    };
  };

  useEffect(() => {
    if (!currentMonth) return;

    const resumen = calcularResumenMantenciones(
      mantencionesMesActual,
      valor_mantencion,
    );
    setResumenMonth(resumen);
    setResumenMonthStore(resumen);
  }, [currentMonth, mantencionesMesActual, valor_mantencion]);

  return (
    <div className={style.totalMes}>
      <span className={style.titleTotal}>Resumen</span>
      {Object.entries(resumenMonth.resumenMateriales).map(([nombre, data]) => (
        <div key={nombre} className={style.totalValues}>
          <span>
            {nombre} - {data.valorUnitario.toLocaleString("es-CL")}
            {" x "}
            {data.cantidad}
          </span>
          <span>${data.total.toLocaleString("es-CL")}</span>
        </div>
      ))}

      <div className={style.totalValues}>
        <strong>Total productos:</strong>
        <span>${resumenMonth.totalProductos.toLocaleString("es-CL")}</span>
      </div>
      <div className={style.totalValues}>
        <strong>Total mantenciones:</strong>
        <span>${resumenMonth.totalMantencion.toLocaleString("es-CL")}</span>
      </div>
      <div className={style.totalValues}>
        <strong>Total general:</strong>
        <span>${resumenMonth.granTotal.toLocaleString("es-CL")}</span>
      </div>
    </div>
  );
};

export default ResumeMaintenance;
