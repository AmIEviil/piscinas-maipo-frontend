import type { IResumeMaintenance } from "../../../../service/maintenance.interface";
import style from "./AggregateChart.module.css";

interface MantencionesTableProps {
  maintenances: IResumeMaintenance[];
}

/** La semana en numeros, sin interpretar. Ver ProductosTable para el porque. */
const MantencionesTable = ({ maintenances }: MantencionesTableProps) => (
  <div className="responsive-scroll-x">
    <table className={style.dataTable}>
      <caption className={style.tableCaption}>
        Mantenciones de la semana por día
      </caption>
      <thead>
        <tr>
          <th scope="col">Día</th>
          <th scope="col">Programadas</th>
          <th scope="col">Realizadas</th>
          <th scope="col">Faltantes</th>
        </tr>
      </thead>
      <tbody>
        {maintenances.map((maintenance) => (
          <tr key={maintenance.dia}>
            <th scope="row">{maintenance.dia}</th>
            <td>{maintenance.programadas}</td>
            <td>{maintenance.realizadas}</td>
            <td>
              {Math.max(0, maintenance.programadas - maintenance.realizadas)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MantencionesTable;
