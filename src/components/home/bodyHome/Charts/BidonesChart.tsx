import GaugeChart from "../../../ui/charts/gauge/GaugeChart";
import style from "./BidonesChart.module.css";
import { type IMetricsProduct } from "../../../../service/products.interface";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { useSolicitudProductosStore } from "../../../../store/SolicitudProductosStore";

interface ProductsChart {
  showPercentage?: boolean;
  loading?: boolean;
  productData: IMetricsProduct;
}

const BidonesChart = ({
  showPercentage = false,
  productData,
  loading,
}: ProductsChart) => {
  const navigate = useNavigate();

  const { openModal, setTypeProduct, setProductosSolicitables } =
    useSolicitudProductosStore();

  // El render ya se protege con `productData &&`, asi que aca tampoco se
  // asume que venga cargado.
  const totalHistorico =
    (productData?.disponibles ?? 0) + (productData?.usados ?? 0);

  const handleOpenModal = () => {
    setTypeProduct(productData.tipo);
    // La tarjeta ya define que producto se solicita: sin lista, el modal no
    // muestra el selector que si usa la alerta de stock bajo del Home.
    setProductosSolicitables([]);
    openModal();
  };

  return (
    <div className={style.bidonesChartContainer}>
      {loading && <CircularProgress />}
      {productData && !loading ? (
        <>
          {/*
            En celular esto era un menu de tres puntos sin etiqueta. Ahora que
            la tarjeta ocupa el ancho completo de la pantalla los dos botones
            caben en una fila, y una accion con su nombre a la vista es mucho
            mas facil de usar que un icono que hay que descubrir. El cambio de
            columna a fila lo hace el CSS, sin depender de window.innerWidth.
          */}
          <div className={style.actionsContainer}>
            <button
              className={style.actionButton}
              onClick={() => navigate("/inventario")}
            >
              Ir a Inventario
            </button>
            <button className={style.actionButton} onClick={handleOpenModal}>
              Solicitar Productos
            </button>
          </div>
          <div>
            {/*
              La metrica trae `disponibles` como lo que queda en bodega y
              `usados` como consumo historico acumulado: son dos escalas
              distintas y compararlas entre si no dice nada (un producto con 93
              usados y 85 disponibles mostraba "93 de 85", con la aguja pasada
              del tope, y parecia agotado teniendo 85 unidades).

              La tarjeta muestra ahora el stock que queda sobre el total
              historico, que es el mismo denominador que usa
              porcentaje_utilizado en el backend. La aguja baja a medida que se
              consume: gauge vacio significa que hay que comprar.
            */}
            <GaugeChart
              minValue={0}
              maxValue={showPercentage ? 100 : totalHistorico}
              actualValue={
                showPercentage
                  ? productData.porcentaje_utilizado
                  : productData.disponibles
              }
              actualValueLabel={
                showPercentage ? "Porcentaje utilizado" : "Stock disponible"
              }
              maxValueLabel={
                showPercentage
                  ? "100%"
                  : "Total histórico (disponible + utilizado)"
              }
              title={productData.tipo}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default BidonesChart;
