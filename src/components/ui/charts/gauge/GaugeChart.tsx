import { useEffect, useRef, useState } from "react";
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

/** Ancho de partida antes del primer medido, para no dibujar un SVG de 0px. */
const TAMANO_INICIAL = 200;

function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };
  // El radio del eje y el grosor de la aguja se derivan del tamano del propio
  // medidor: con 5px y 2px fijos la aguja quedaba como un pelo al subir el
  // nivel de letra y el medidor crecer con ella.
  const radioEje = Math.max(4, outerRadius * 0.05);
  return (
    <g>
      <circle cx={cx} cy={cy} r={radioEje} fill="currentColor" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="currentColor"
        strokeWidth={Math.max(2, outerRadius * 0.02)}
        strokeLinecap="round"
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

  /*
   * El SVG del medidor se dimensiona en px, pero el control de tamano de letra
   * del TopBar cambia el font-size del <html>. Antes el SVG estaba fijo en
   * 200px mientras las etiquetas se posicionaban con desplazamientos en rem:
   * al subir la letra los rem crecian, el SVG no, y los valores minimo, actual
   * y maximo se salian del arco.
   *
   * Ahora se mide el ancho real del contenedor (que si esta en rem) y ese es el
   * lado del SVG. El observador mide el contenedor, no el SVG, y el contenedor
   * se dimensiona por su max-width y no por sus hijos: no hay realimentacion.
   */
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [tamano, setTamano] = useState(TAMANO_INICIAL);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const medir = () => {
      const ancho = contenedor.clientWidth;
      if (ancho > 0) setTamano(ancho);
    };

    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(contenedor);
    return () => observer.disconnect();
  }, []);

  const descripcion = `${title ?? actualValueLabel}: ${actualValue} de ${maxValue}. ${actualValueLabel}.`;

  return (
    <figure className={style.gaugeContainer} aria-label={descripcion}>
      {title ? <figcaption className={style.titleGauge}>{title}</figcaption> : null}

      {/* El arco vive en su propia caja medida; las etiquetas van despues, en
          flujo normal, sin desplazamientos negativos que dependan del rem. */}
      <div className={style.gaugeArc} ref={contenedorRef}>
        <GaugeContainer
          width={tamano}
          height={tamano}
          startAngle={-110}
          endAngle={110}
          value={actualValue}
          valueMin={minValue}
          valueMax={safeMaxValue}
          innerRadius="70%"
          outerRadius="100%"
          aria-hidden
        >
          <GaugeValueArc />
          <GaugePointer />
          <GaugeReferenceArc />
        </GaugeContainer>
      </div>

      {/*
        Fila de valores en flujo normal: minimo, valor actual y maximo.

        Sube hacia el hueco del arco con un margen negativo en PORCENTAJE, que
        se resuelve contra el ancho del contenedor, es decir contra el lado del
        propio medidor. Asi la fila acompana al arco cualquiera sea el nivel de
        letra. En rem no lo hacia: el rem crecia y el arco no.
      */}
      <div className={style.rangeRow}>
        <Tooltip title={minValueLabel} arrow leaveDelay={0}>
          <span className={style.rangeValue}>{minValue}</span>
        </Tooltip>
        <Tooltip title={actualValueLabel} arrow leaveDelay={0}>
          <span className={style.actualValue}>{actualValue}</span>
        </Tooltip>
        <Tooltip title={maxValueLabel} arrow leaveDelay={0}>
          <span className={style.rangeValue}>{maxValue}</span>
        </Tooltip>
      </div>
    </figure>
  );
};
export default GaugeChart;
