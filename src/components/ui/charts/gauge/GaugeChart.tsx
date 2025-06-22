import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import style from "./GaugeChart.module.css";

interface CustomGaugeChartProps {
  title?: string;
  minValue: number;
  maxValue: number;
  actualValue: number;
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
}: CustomGaugeChartProps) => {
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
        valueMax={maxValue}
        innerRadius="70%"
        outerRadius="100%"
      >
        <GaugeValueArc />
        <GaugePointer />
        <GaugeReferenceArc />
      </GaugeContainer>
      <div className={style.spanGaugeContainer}>
        <p className={style.minRange}>{minValue}</p>
        <span className={style.actualValue}>{actualValue}</span>
        <p className={style.maxRange}>{maxValue}</p>
      </div>
    </div>
  );
};
export default GaugeChart;
