import BidonesChart from "./Charts/BidonesChart";
import style from "./BodyHome.module.css";
import { useEffect, useState } from "react";
import { useProductsMetrics } from "../../../hooks/ProductHooks";
import { type IMetricsProduct } from "../../../service/productsInterface";

export default function BodyHome() {
  const [metrics, setMetrics] = useState<IMetricsProduct[]>();
  const [loadingChart, setLoadingChart] = useState(true);
  const productsMetricsMutation = useProductsMetrics();

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

  useEffect(() => {
    fetchMetricsData();
  }, []);

  return (
    <div className={style.bodyHomeContainer}>
      <div className={style.chartsContainer}>
        {metrics?.map((metric, index) => (
          <BidonesChart
            key={index}
            productData={metric}
            loading={loadingChart}
          />
        ))}
      </div>
      <div className={style.resumeMaintenance}>
        <span>Resumen Mantenciones</span>
      </div>
    </div>
  );
}
