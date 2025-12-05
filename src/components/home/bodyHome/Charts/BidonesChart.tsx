import GaugeChart from "../../../ui/charts/gauge/GaugeChart";
import style from "./BidonesChart.module.css";
import { type IMetricsProduct } from "../../../../service/products.interface";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { useSolicitudProductosStore } from "../../../../store/SolicitudProductosStore";
import CustomDropmenuV2 from "../../../ui/customdropmenu/CustomDropmenuV2";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useEffect, useState } from "react";

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleOpenModal = () => {
    setTypeProduct(productData.tipo);
    openModal();
  };

  const options = [
    {
      label: "Ir a Inventario",
      onClick: () => navigate("/inventario"),
    },
    {
      label: "Solicitar Productos",
      onClick: handleOpenModal,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={style.bidonesChartContainer}>
      {loading && <CircularProgress />}
      {productData && !loading ? (
        <>
          {windowWidth > 720 ? (
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
          ) : (
            <CustomDropmenuV2 options={options} icon={<MoreHorizIcon />} />
          )}
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
