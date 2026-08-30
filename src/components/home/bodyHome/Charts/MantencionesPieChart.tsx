import { PieChart } from "@mui/x-charts/PieChart";
import type { IResumeMaintenance } from "../../../../service/maintenance.interface";
import { useVizPalette } from "../../../ui/charts/chartPalette";
import { buildChartSx } from "../../../ui/charts/chartSx";
import { useRootFontSize } from "../../../ui/charts/useRootFontSize";
import style from "./AggregateChart.module.css";

interface MantencionesPieChartProps {
  maintenances: IResumeMaintenance[];
}

/**
 * Cumplimiento de la semana en una sola cifra visual: que parte de lo
 * programado ya se hizo. Es la vista de "como vamos", no la de "que dia falla";
 * para eso estan las barras.
 */
const MantencionesPieChart = ({ maintenances }: MantencionesPieChartProps) => {
  const palette = useVizPalette();
  const rem = useRootFontSize();

  const programadas = maintenances.reduce(
    (suma, maintenance) => suma + maintenance.programadas,
    0
  );
  const realizadas = maintenances.reduce(
    (suma, maintenance) => suma + maintenance.realizadas,
    0
  );
  const faltantes = Math.max(0, programadas - realizadas);

  if (programadas === 0) {
    return (
      <p className={style.emptyMessage}>
        No hay mantenciones programadas esta semana.
      </p>
    );
  }

  const porcentaje = Math.round((realizadas / programadas) * 100);

  return (
    <div className={style.aggregateChart}>
      {/* La cifra que resume todo se escribe, no se deduce del arco. */}
      <p className={style.heroFigure}>
        <strong>{porcentaje}%</strong>
        <span>
          {realizadas} de {programadas} mantenciones realizadas
        </span>
      </p>
      <PieChart
        height={17 * rem}
        series={[
          {
            data: [
              {
                id: "realizadas",
                value: realizadas,
                label: "Realizadas",
                color: palette.series[0],
              },
              {
                id: "faltantes",
                value: faltantes,
                label: "Faltantes",
                color: palette.series[1],
              },
            ],
            innerRadius: "55%",
            outerRadius: "90%",
            paddingAngle: 1.5,
            cornerRadius: 4,
            highlightScope: { fade: "global", highlight: "item" },
          },
        ]}
        sx={buildChartSx(palette)}
      />
    </div>
  );
};

export default MantencionesPieChart;
