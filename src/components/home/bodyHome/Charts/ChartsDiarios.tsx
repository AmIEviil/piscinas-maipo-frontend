import { CircularProgress } from "@mui/material";
import type { IResumeMaintenance } from "../../../../service/maintenance.interface";
import GaugeChart from "../../../ui/charts/gauge/GaugeChart";
import style from "./ChartsDiarios.module.css";
import { useNavigate } from "react-router";
import { useBoundStore } from "../../../../store/BoundedStore";

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
  const navigate = useNavigate();
  const setDayFilter = useBoundStore((state) => state.setDayFilter);

  const handleSeeDayDetails = () => {
    setDayFilter(productData.dia);
    navigate("/clientes");
  };

  return (
    <div className={style.diasChartContainer}>
      {loading && <CircularProgress />}
      {productData && !loading ? (
        <>
          {/*
            Igual que en BidonesChart: en celular esto era un menu de tres
            puntos sin etiqueta. Con la tarjeta a ancho completo los dos
            botones caben en una fila y se leen sin tener que abrirlos.
          */}
          <div className={style.actionsContainer}>
            <button className={style.actionButton} onClick={handleSeeDayDetails}>
              Detalles dia
            </button>
            <button
              className={style.actionButton}
              onClick={() => navigate("/clientes")}
            >
              Ir a Clientes
            </button>
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
                actualValueLabel="Mantenciones realizadas"
                maxValueLabel="Mantenciones programadas"
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
