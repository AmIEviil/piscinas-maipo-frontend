import { BarChart } from "@mui/x-charts/BarChart";
import type { IMetricsProduct } from "../../../../service/products.interface";
import { useVizPalette } from "../../../ui/charts/chartPalette";
import { buildChartSx } from "../../../ui/charts/chartSx";
import { useRootFontSize } from "../../../ui/charts/useRootFontSize";
import style from "./AggregateChart.module.css";

interface ProductosBarChartProps {
  metrics: IMetricsProduct[];
}

/**
 * Todos los productos comparados en un solo grafico.
 *
 * Es la vista que responde "que me falta" de un vistazo, sin recorrer seis
 * medidores. Las barras van horizontales a proposito: los nombres de producto
 * son largos y como etiquetas de un eje vertical se cortan o se inclinan,
 * y peor todavia al subir el nivel de letra.
 *
 * Dos series, disponibles y usados, agrupadas y no apiladas: son cosas
 * distintas (lo que queda en bodega y el consumo historico acumulado) y
 * sumarlas en una barra unica no significa nada.
 */
const ProductosBarChart = ({ metrics }: ProductosBarChartProps) => {
  const palette = useVizPalette();
  const rem = useRootFontSize();

  // Del mas escaso al mas holgado: lo urgente arriba.
  const dataset = [...metrics]
    .sort((a, b) => a.disponibles - b.disponibles)
    .map((metric) => ({
      tipo: metric.tipo,
      disponibles: metric.disponibles,
      usados: metric.usados,
    }));

  // Todo en rem convertidos a px: el grafico crece con el nivel de letra en vez
  // de quedarse fijo mientras las etiquetas se agrandan.
  const altoPorFila = 3.75 * rem;
  const alto = Math.max(14 * rem, dataset.length * altoPorFila + 6 * rem);
  // Los nombres de producto son largos ("Bidones de acido muriatico"): con un
  // eje angosto MUI los corta con puntos suspensivos y dejan de identificar la
  // barra. El ancho se reparte con el area de dibujo, sin pasar del 40%.
  const anchoEjeNombres = 12.5 * rem;

  return (
    <div className={style.aggregateChart}>
      <BarChart
        dataset={dataset}
        layout="horizontal"
        height={alto}
        yAxis={[
          {
            scaleType: "band",
            dataKey: "tipo",
            width: anchoEjeNombres,
            tickLabelStyle: { fontSize: 0.875 * rem },
          },
        ]}
        xAxis={[
          {
            label: "Unidades",
            tickLabelStyle: { fontSize: 0.875 * rem },
            labelStyle: { fontSize: 0.875 * rem },
          },
        ]}
        series={[
          {
            dataKey: "disponibles",
            label: "Disponibles en bodega",
            color: palette.series[0],
          },
          {
            dataKey: "usados",
            label: "Utilizados (histórico)",
            color: palette.series[1],
          },
        ]}
        borderRadius={4}
        grid={{ vertical: true }}
        margin={{ top: 0.5 * rem, right: rem, bottom: 0, left: 0 }}
        sx={buildChartSx(palette)}
      />
    </div>
  );
};

export default ProductosBarChart;
