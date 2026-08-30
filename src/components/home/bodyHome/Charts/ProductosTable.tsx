import type { IMetricsProduct } from "../../../../service/products.interface";
import style from "./AggregateChart.module.css";

interface ProductosTableProps {
  metrics: IMetricsProduct[];
}

/**
 * Los mismos datos sin interpretar.
 *
 * No es solo una alternativa de gusto: es la lectura obligatoria para quien no
 * distingue los colores de las series, y la que prefiere buena parte del
 * publico de la aplicacion, que lee la cifra mas rapido de lo que interpreta un
 * arco.
 */
const ProductosTable = ({ metrics }: ProductosTableProps) => {
  const ordenados = [...metrics].sort((a, b) => a.disponibles - b.disponibles);

  return (
    <div className="responsive-scroll-x">
      <table className={style.dataTable}>
        <caption className={style.tableCaption}>
          Stock por producto, del más escaso al más holgado
        </caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Disponibles</th>
            <th scope="col">Utilizados</th>
            <th scope="col">% utilizado</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map((metric) => (
            <tr key={metric.tipo}>
              <th scope="row">{metric.tipo}</th>
              <td>{metric.disponibles}</td>
              <td>{metric.usados}</td>
              <td>{Math.round(metric.porcentaje_utilizado)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductosTable;
