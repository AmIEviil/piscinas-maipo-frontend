import { PieChart } from "@mui/x-charts/PieChart";
import type { IMetricsProduct } from "../../../../service/products.interface";
import {
  MAX_SERIES_SLOTS,
  useVizPalette,
} from "../../../ui/charts/chartPalette";
import { buildChartSx } from "../../../ui/charts/chartSx";
import { useRootFontSize } from "../../../ui/charts/useRootFontSize";
import style from "./AggregateChart.module.css";

interface ProductosPieChartProps {
  metrics: IMetricsProduct[];
}

/**
 * Como se reparte el stock disponible entre los tipos de producto.
 *
 * Responde una pregunta distinta a la de las barras: no cuanto hay de cada uno,
 * sino que peso tiene cada uno dentro del total. Sirve para ver de un vistazo si
 * la bodega esta concentrada en un solo producto.
 */
const ProductosPieChart = ({ metrics }: ProductosPieChartProps) => {
  const palette = useVizPalette();
  const rem = useRootFontSize();

  const ordenados = [...metrics]
    .filter((metric) => metric.disponibles > 0)
    .sort((a, b) => b.disponibles - a.disponibles);

  /*
   * Los colores de serie se asignan en orden fijo y nunca se ciclan: a partir
   * de la novena categoria el resto se agrupa en "Otros" en vez de repetir un
   * tono ya usado, que haria que dos porciones distintas se vieran iguales.
   */
  const visibles = ordenados.slice(0, MAX_SERIES_SLOTS - 1);
  const resto = ordenados.slice(MAX_SERIES_SLOTS - 1);
  const restoTotal = resto.reduce((suma, metric) => suma + metric.disponibles, 0);

  const data = [
    ...visibles.map((metric, index) => ({
      id: metric.tipo,
      value: metric.disponibles,
      label: metric.tipo,
      color: palette.series[index],
    })),
    ...(restoTotal > 0
      ? [
          {
            id: "otros",
            value: restoTotal,
            label: `Otros (${resto.length})`,
            color: palette.series[MAX_SERIES_SLOTS - 1],
          },
        ]
      : []),
  ];

  const total = data.reduce((suma, item) => suma + item.value, 0);

  if (total === 0) {
    return (
      <p className={style.emptyMessage}>
        No hay stock disponible para repartir. Revisa la vista de tabla para ver
        el detalle por producto.
      </p>
    );
  }

  return (
    <div className={style.aggregateChart}>
      <PieChart
        height={20 * rem}
        series={[
          {
            data,
            innerRadius: "45%",
            outerRadius: "90%",
            paddingAngle: 1.5,
            cornerRadius: 4,
            // Etiqueta directa sobre cada porcion: la identidad no depende del
            // color, que es obligatorio para las ranuras de bajo contraste.
            arcLabel: (item) =>
              `${Math.round((item.value / total) * 100)}%`,
            arcLabelMinAngle: 22,
            highlightScope: { fade: "global", highlight: "item" },
            valueFormatter: (item) =>
              `${item.value} unidades (${Math.round((item.value / total) * 100)}%)`,
          },
        ]}
        sx={{
          ...buildChartSx(palette),
          /*
           * Blanco con halo oscuro. Sin el halo el porcentaje se pierde sobre
           * las porciones claras (amarillo, aguamarina): blanco sobre esos
           * tonos no llega al contraste minimo para texto pequeno.
           */
          "& .MuiPieArcLabel-root": {
            fill: "#ffffff",
            fontWeight: 700,
            fontSize: 0.8125 * rem,
            stroke: "rgba(0, 0, 0, 0.65)",
            strokeWidth: 3,
            paintOrder: "stroke",
          },
        }}
      />
    </div>
  );
};

export default ProductosPieChart;
