import GaugeChart from "../../../ui/charts/gauge/GaugeChart";
import style from "./BidonesChart.module.css";

const estadisticasBidones = {
  minValue: 0,
  maxValue: 30,
  actualValue: 15,
};

const BidonesChart = () => {
  return (
    <div className={style.bidonesChartContainer}>
      <div className={style.actionsContainer}>
        <button className={style.actionButton}>Detalles</button>
        <button className={style.actionButton}>Detalles</button>
        <button className={style.actionButton}>Solicitar Productos</button>
      </div>
      <div>
        <GaugeChart
          minValue={estadisticasBidones.minValue}
          maxValue={estadisticasBidones.maxValue}
          actualValue={estadisticasBidones.actualValue}
          title="Tabletas Utilizadas"
        />
      </div>
    </div>
  );
};

export default BidonesChart;
