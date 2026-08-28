import { CircularProgress } from "@mui/material";
import type { IResumeMaintenance } from "../../../../service/maintenance.interface";
import GaugeChart from "../../../ui/charts/gauge/GaugeChart";
import style from "./ChartsDiarios.module.css";
import { useNavigate } from "react-router";
import { useBoundStore } from "../../../../store/BoundedStore";

interface ProductsChart {
  loading?: boolean;
  productData: IResumeMaintenance;
}

const ChartDiario = ({ productData, loading }: ProductsChart) => {
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
          <div className={style.chartContainer}>
            {noMaintenancesToDo ? (
              <span className={style.noMaintenancesToDo}>
                Sin mantenciones programadas para el día {productData.dia}
              </span>
            ) : (
              /*
               * Antes el valor del medidor salia de un ternario sobre
               * showPercentage cuyas dos ramas devolvian `realizadas`: la prop
               * no cambiaba nada y se elimino junto con el ternario.
               */
              <GaugeChart
                minValue={0}
                maxValue={productData.programadas}
                actualValue={productData.realizadas}
                actualValueLabel="Mantenciones realizadas"
                maxValueLabel="Mantenciones programadas"
                title={productData.dia}
              />
            )}
          </div>

          {/* Igual que en BidonesChart: acciones debajo y con nombre a la
              vista, no un menu de tres puntos sin etiqueta. */}
          <div className={style.actionsContainer}>
            <button className={style.actionButton} onClick={handleSeeDayDetails}>
              Detalles día
            </button>
            <button
              className={style.actionButton}
              onClick={() => navigate("/clientes")}
            >
              Ir a Clientes
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChartDiario;
