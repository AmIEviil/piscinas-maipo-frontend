import { BarChart } from "@mui/x-charts/BarChart";
import type { IResumeMaintenance } from "../../../../service/maintenance.interface";
import { useVizPalette } from "../../../ui/charts/chartPalette";
import { buildChartSx } from "../../../ui/charts/chartSx";
import { useRootFontSize } from "../../../ui/charts/useRootFontSize";
import style from "./AggregateChart.module.css";

interface MantencionesBarChartProps {
  maintenances: IResumeMaintenance[];
}

/**
 * La semana completa en un solo grafico.
 *
 * Realizadas y faltantes van APILADAS porque las dos suman las programadas del
 * dia: el alto total de cada barra es la carga del dia y el corte muestra
 * cuanto se cubrio. Es la unica lectura de esta pantalla donde apilar dice
 * algo.
 *
 * No se usan verde y rojo aunque el significado lo pida: ese par no se
 * distingue con deuteranopia. Los colores de estado quedan para los
 * indicadores, donde viajan con icono y texto.
 */
const MantencionesBarChart = ({ maintenances }: MantencionesBarChartProps) => {
  const palette = useVizPalette();
  const rem = useRootFontSize();

  const dataset = maintenances.map((maintenance) => ({
    dia: maintenance.dia,
    realizadas: maintenance.realizadas,
    faltantes: Math.max(0, maintenance.programadas - maintenance.realizadas),
  }));

  return (
    <div className={style.aggregateChart}>
      <BarChart
        dataset={dataset}
        height={20 * rem}
        xAxis={[
          {
            scaleType: "band",
            dataKey: "dia",
            tickLabelStyle: { fontSize: 0.875 * rem },
            categoryGapRatio: 0.4,
          },
        ]}
        yAxis={[
          {
            label: "Mantenciones",
            width: 3.5 * rem,
            tickLabelStyle: { fontSize: 0.875 * rem },
            labelStyle: { fontSize: 0.875 * rem },
          },
        ]}
        series={[
          {
            dataKey: "realizadas",
            label: "Realizadas",
            color: palette.series[0],
            stack: "dia",
          },
          {
            dataKey: "faltantes",
            label: "Faltantes",
            color: palette.series[1],
            stack: "dia",
          },
        ]}
        borderRadius={4}
        grid={{ horizontal: true }}
        margin={{ top: 0.5 * rem, right: rem, bottom: 0, left: 0 }}
        sx={buildChartSx(palette)}
      />
    </div>
  );
};

export default MantencionesBarChart;
