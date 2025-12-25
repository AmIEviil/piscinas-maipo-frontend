import BidonesChart from "./Charts/BidonesChart";
import ChartDiario from "./Charts/ChartsDiarios";
import style from "./BodyHome.module.css";
import { useEffect, useState } from "react";
import { useProductsMetrics } from "../../../hooks/ProductHooks";
import { type IMetricsProduct } from "../../../service/products.interface";
import { type IResumeMaintenance } from "../../../service/maintenance.interface";
import { useDailyMetrics } from "../../../hooks/MetricsHooks";

export default function BodyHome() {
  const [metrics, setMetrics] = useState<IMetricsProduct[]>();
  const [maintenancesMetrics, setMaintenancesMetrics] =
    useState<IResumeMaintenance[]>();
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingMaintenanceChart, setLoadingMaintenanceChart] = useState(true);
  const productsMetricsMutation = useProductsMetrics();
  const maintenanceMetricsMutation = useDailyMetrics();

  const fetchMetricsData = async () => {
    setLoadingChart(true);
    try {
      const metricsData = await productsMetricsMutation.mutateAsync();
      setMetrics(metricsData);
      setLoadingChart(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMaintenanceMetricsData = async () => {
    setLoadingMaintenanceChart(true);
    try {
      const maintenanceData = await maintenanceMetricsMutation.mutateAsync();
      setMaintenancesMetrics(maintenanceData);
      setLoadingMaintenanceChart(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMetricsData();
    fetchMaintenanceMetricsData();
  }, []);

  return (
    <div className={style.bodyHomeContainer}>
      <div className={style.chartsHomeContainer}>
        <span className={style.titleChart}>Productos</span>
        <div className={`${style.resumeMaintenance} custom-scrollbar`}>
          {metrics?.map((metric, index) => (
            <BidonesChart
              key={index}
              productData={metric}
              loading={loadingChart}
            />
          ))}
        </div>
      </div>
      <div className={style.chartsHomeContainer}>
        <span className={style.titleChart}>Mantenciones</span>
        <div className={`${style.resumeMaintenance} custom-scrollbar`}>
          {maintenancesMetrics?.map((maintenance, index) => (
            <ChartDiario
              key={index}
              productData={maintenance}
              loading={loadingMaintenanceChart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
