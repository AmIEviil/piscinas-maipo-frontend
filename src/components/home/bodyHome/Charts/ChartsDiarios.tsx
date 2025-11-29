import { CircularProgress } from "@mui/material";
import type { IResumeMaintenance } from "../../../../service/maintenanceInterface";
import GaugeChart from "../../../ui/charts/gauge/GaugeChart";
import style from "./ChartsDiarios.module.css";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import CustomDropmenuV2 from "../../../ui/customdropmenu/CustomDropmenuV2";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useBoundStore } from "../../../../store/BoundedStore";

interface ProductsChart {
  showPercentage?: boolean;
  loading?: boolean;
  productData: IResumeMaintenance;
}

const ChartDiario = ({
  showPercentage = false,
  productData,
  loading,
}: ProductsChart) => {
  const noMaintenancesToDo = productData.programadas === 0;
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const setDayFilter = useBoundStore((state) => state.setDayFilter);

  const options = [
    {
      label: "Ir a Clientes",
      onClick: () => navigate("/clientes"),
    },
    {
      label: "Detalles dia",
      onClick: () => {
        console.log("Detalles dia clicked");
      },
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

  const handleSeeDayDetails = () => {
    setDayFilter(productData.dia);
    navigate("/clientes");
  };

  return (
    <div className={style.diasChartContainer}>
      {loading && <CircularProgress />}
      {productData && !loading ? (
        <>
          {windowWidth > 720 ? (
            <div className={style.actionsContainer}>
              <button
                className={style.actionButton}
                onClick={handleSeeDayDetails}
              >
                Detalles dia
              </button>
              <button
                className={style.actionButton}
                onClick={() => navigate("/clientes")}
              >
                Ir a Clientes
              </button>
            </div>
          ) : (
            <CustomDropmenuV2 options={options} icon={<MoreHorizIcon />} />
          )}
          <div className={style.chartContainer}>
            {noMaintenancesToDo ? (
              <span className={style.noMaintenancesToDo}>
                Sin Mantenciones programadas para el dia {productData.dia}
              </span>
            ) : (
              <GaugeChart
                minValue={0}
                maxValue={productData.programadas}
                actualValue={
                  showPercentage
                    ? productData.realizadas
                    : productData.realizadas
                }
                title={productData.dia}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChartDiario;
