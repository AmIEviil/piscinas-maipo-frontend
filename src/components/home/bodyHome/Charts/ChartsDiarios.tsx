import { CircularProgress } from "@mui/material";
import type { IResumeMaintenance } from "../../../../service/maintenanceInterface";
import GaugeChart from "../../../ui/charts/gauge/GaugeChart";
import style from "./ChartsDiarios.module.css";

interface ProductsChart {
  showPercentage?: boolean;
  loading?: boolean;
  productData: IResumeMaintenance;
}

const ChartDiario = ({
  showPercentage = false,
  productData,
  loading,
}: ProductsChart) => {
  const noMaintenancesToDo = productData.programadas === 0;
  return (
    <div className={style.diasChartContainer}>
      {loading && <CircularProgress />}
      {productData && !loading ? (
        <>
          <div className={style.actionsContainer}>
            <button className={style.actionButton}>Detalles dia</button>
            <button className={style.actionButton}>Ir a Clientes</button>
          </div>
          <div className={style.chartContainer}>
            {noMaintenancesToDo ? (
              <span className={style.noMaintenancesToDo}>
                Sin Mantenciones programadas para el dia {productData.dia}
              </span>
            ) : (
              <GaugeChart
                minValue={0}
                maxValue={productData.programadas}
                actualValue={
                  showPercentage
                    ? productData.realizadas
                    : productData.realizadas
                }
                title={productData.dia}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChartDiario;
