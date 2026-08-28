import { useCallback, useEffect, useRef, useState } from "react";
import BidonesChart from "./Charts/BidonesChart";
import ChartDiario from "./Charts/ChartsDiarios";
import ChartSection from "./ChartSection";
import ProductosBarChart from "./Charts/ProductosBarChart";
import ProductosPieChart from "./Charts/ProductosPieChart";
import ProductosTable from "./Charts/ProductosTable";
import MantencionesBarChart from "./Charts/MantencionesBarChart";
import MantencionesPieChart from "./Charts/MantencionesPieChart";
import MantencionesTable from "./Charts/MantencionesTable";
import HomeKpis from "../kpis/HomeKpis";
import { useChartView } from "./Charts/chartViews";
import style from "./BodyHome.module.css";
import { useProductsMetrics } from "../../../hooks/ProductHooks";
import { type IMetricsProduct } from "../../../service/products.interface";
import { type IResumeMaintenance } from "../../../service/maintenance.interface";
import { useDailyMetrics } from "../../../hooks/MetricsHooks";

interface BodyHomeProps {
  /** Productos agotados o bajo su minimo, ya calculados por HomeView. */
  productosBajoMinimo: number;
  /** Dia habil de hoy, o null si es fin de semana. */
  diaActual: string | null;
  /** Lleva al flujo de solicitud desde el indicador de stock bajo. */
  onVerBajoMinimo?: () => void;
}

export default function BodyHome({
  productosBajoMinimo,
  diaActual,
  onVerBajoMinimo,
}: BodyHomeProps) {
  const [metrics, setMetrics] = useState<IMetricsProduct[]>();
  const [maintenancesMetrics, setMaintenancesMetrics] =
    useState<IResumeMaintenance[]>();
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingMaintenanceChart, setLoadingMaintenanceChart] = useState(true);
  const [errorChart, setErrorChart] = useState<string | null>(null);
  const [errorMaintenanceChart, setErrorMaintenanceChart] = useState<
    string | null
  >(null);

  const [vistaProductos, setVistaProductos] = useChartView(
    "home-chart-view-productos"
  );
  const [vistaMantenciones, setVistaMantenciones] = useChartView(
    "home-chart-view-mantenciones"
  );

  const productsMetricsMutation = useProductsMetrics();
  const maintenanceMetricsMutation = useDailyMetrics();

  // Las mutations de react-query se recrean en cada render; guardar mutateAsync
  // en refs deja los callbacks con dependencias estables y sin desactivar la
  // regla de dependencias de los efectos.
  const productsRef = useRef(productsMetricsMutation.mutateAsync);
  productsRef.current = productsMetricsMutation.mutateAsync;
  const maintenanceRef = useRef(maintenanceMetricsMutation.mutateAsync);
  maintenanceRef.current = maintenanceMetricsMutation.mutateAsync;

  const fetchMetricsData = useCallback(async () => {
    setLoadingChart(true);
    setErrorChart(null);
    try {
      setMetrics(await productsRef.current());
    } catch (error) {
      console.error("Error obteniendo las metricas de productos:", error);
      setErrorChart("No se pudieron cargar los datos de productos.");
    } finally {
      // En finally y no en el try: con el fallo dentro del try el spinner se
      // quedaba girando para siempre.
      setLoadingChart(false);
    }
  }, []);

  const fetchMaintenanceMetricsData = useCallback(async () => {
    setLoadingMaintenanceChart(true);
    setErrorMaintenanceChart(null);
    try {
      setMaintenancesMetrics(await maintenanceRef.current());
    } catch (error) {
      console.error("Error obteniendo las metricas de mantenciones:", error);
      setErrorMaintenanceChart(
        "No se pudieron cargar los datos de mantenciones."
      );
    } finally {
      setLoadingMaintenanceChart(false);
    }
  }, []);

  // En StrictMode el efecto de montaje corre dos veces: el ref evita la segunda
  // tanda de peticiones.
  const yaConsultado = useRef(false);
  useEffect(() => {
    if (yaConsultado.current) return;
    yaConsultado.current = true;
    fetchMetricsData();
    fetchMaintenanceMetricsData();
  }, [fetchMetricsData, fetchMaintenanceMetricsData]);

  const productos = metrics ?? [];
  const mantenciones = maintenancesMetrics ?? [];

  return (
    <div className={style.bodyHomeContainer}>
      <HomeKpis
        metrics={metrics}
        maintenances={maintenancesMetrics}
        productosBajoMinimo={productosBajoMinimo}
        diaActual={diaActual}
        onVerBajoMinimo={onVerBajoMinimo}
      />

      <div className={style.sectionsGrid}>
        <ChartSection
          titulo="Productos"
          vista={vistaProductos}
          onVistaChange={setVistaProductos}
          loading={loadingChart}
          error={errorChart}
          onReintentar={fetchMetricsData}
          vacio={productos.length === 0}
          mensajeVacio="Todavía no hay productos con movimiento para mostrar."
        >
          {vistaProductos === "medidores" &&
            productos.map((metric) => (
              <BidonesChart key={metric.tipo} productData={metric} />
            ))}
          {vistaProductos === "barras" && (
            <ProductosBarChart metrics={productos} />
          )}
          {vistaProductos === "dona" && <ProductosPieChart metrics={productos} />}
          {vistaProductos === "tabla" && <ProductosTable metrics={productos} />}
        </ChartSection>

        <ChartSection
          titulo="Mantenciones"
          vista={vistaMantenciones}
          onVistaChange={setVistaMantenciones}
          loading={loadingMaintenanceChart}
          error={errorMaintenanceChart}
          onReintentar={fetchMaintenanceMetricsData}
          vacio={mantenciones.length === 0}
          mensajeVacio="No hay mantenciones registradas para esta semana."
        >
          {vistaMantenciones === "medidores" &&
            mantenciones.map((maintenance) => (
              <ChartDiario key={maintenance.dia} productData={maintenance} />
            ))}
          {vistaMantenciones === "barras" && (
            <MantencionesBarChart maintenances={mantenciones} />
          )}
          {vistaMantenciones === "dona" && (
            <MantencionesPieChart maintenances={mantenciones} />
          )}
          {vistaMantenciones === "tabla" && (
            <MantencionesTable maintenances={mantenciones} />
          )}
        </ChartSection>
      </div>
    </div>
  );
}
