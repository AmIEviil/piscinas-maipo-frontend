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

  const { openModal, setTypeProduct } = useSolicitudProductosStore();

  const handleOpenModal = () => {
    setTypeProduct(productData.tipo);
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
            <GaugeChart
              minValue={0}
              maxValue={productData.disponibles}
              actualValue={
                showPercentage
                  ? productData.porcentaje_utilizado
                  : productData.usados
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
