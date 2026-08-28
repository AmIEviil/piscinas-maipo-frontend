import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import style from "./GaugeChart.module.css";
import { Tooltip } from "@mui/material";

interface CustomGaugeChartProps {
  title?: string;
  minValue: number;
  maxValue: number;
  actualValue: number;
  /**
   * Que representa el numero del centro. El gauge se usa para cosas distintas
   * (stock que queda, mantenciones realizadas), asi que el tooltip fijo
   * "Utilizado" mentia en la mitad de los casos.
   */
  actualValueLabel?: string;
  minValueLabel?: string;
  maxValueLabel?: string;
}

function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="white" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}

const GaugeChart = ({
  title,
  minValue = 0,
  maxValue = 100,
  actualValue = 20,
  actualValueLabel = "Utilizado",
  minValueLabel = "Valor mínimo",
  maxValueLabel = "Valor máximo",
}: CustomGaugeChartProps) => {
  // Con maxValue igual a minValue el angulo de la aguja queda indefinido y el
  // grafico se rompe: pasa con un producto recien creado, sin stock ni uso.
  const safeMaxValue = maxValue > minValue ? maxValue : minValue + 1;

  return (
    <div className={style.gaugeContainer}>
      <div className={style.titleGaugeContainer}>
        <span className={style.titleGauge}>{title}</span>
      </div>
      <GaugeContainer
        width={200}
        height={200}
        startAngle={-110}
        endAngle={110}
        value={actualValue}
        valueMin={minValue}
        valueMax={safeMaxValue}
        innerRadius="70%"
        outerRadius="100%"
      >
        <GaugeValueArc />
        <GaugePointer />
        <GaugeReferenceArc />
      </GaugeContainer>
      <div className={style.spanGaugeContainer}>
        <Tooltip title={minValueLabel} arrow leaveDelay={0}>
          <p className={style.minRange}>{minValue}</p>
        </Tooltip>
        <Tooltip title={actualValueLabel} arrow leaveDelay={0}>
          <span className={style.actualValue}>{actualValue}</span>
        </Tooltip>
        <Tooltip title={maxValueLabel} arrow leaveDelay={0}>
          <p className={style.maxRange}>{maxValue}</p>
        </Tooltip>
      </div>
    </div>
  );
};
export default GaugeChart;
