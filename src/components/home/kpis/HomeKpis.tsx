import type { ReactNode } from "react";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import type { IMetricsProduct } from "../../../service/products.interface";
import type { IResumeMaintenance } from "../../../service/maintenance.interface";
import style from "./HomeKpis.module.css";

/**
 * Tono de un indicador. El color NUNCA viaja solo: cada tono llega siempre
 * acompanado de su icono y de su texto, porque verde y rojo no se distinguen
 * con deuteranopia y porque estos numeros los lee gente que no siempre percibe
 * el matiz.
 */
type Tono = "neutral" | "good" | "warning" | "critical";

interface Kpi {
  id: string;
  etiqueta: string;
  valor: string;
  detalle: string;
  tono: Tono;
  icono: ReactNode;
  /** Si esta, la tarjeta es un boton y lleva a resolver lo que informa. */
  onClick?: () => void;
}

interface HomeKpisProps {
  metrics?: IMetricsProduct[];
  maintenances?: IResumeMaintenance[];
  /** Productos agotados o bajo su stock minimo, ya calculados por el Home. */
  productosBajoMinimo: number;
  /** Dia habil de hoy, o null si es fin de semana. */
  diaActual: string | null;
  onVerBajoMinimo?: () => void;
}

/**
 * Fila de indicadores del Home.
 *
 * Todo sale de datos que la vista ya pidio: no agrega ni una llamada al
 * backend. Responde de un vistazo las cuatro preguntas con las que se abre la
 * aplicacion, sin tener que interpretar ningun grafico.
 */
const HomeKpis = ({
  metrics,
  maintenances,
  productosBajoMinimo,
  diaActual,
  onVerBajoMinimo,
}: HomeKpisProps) => {
  const stockTotal = (metrics ?? []).reduce(
    (suma, metric) => suma + metric.disponibles,
    0
  );

  const programadas = (maintenances ?? []).reduce(
    (suma, maintenance) => suma + maintenance.programadas,
    0
  );
  const realizadas = (maintenances ?? []).reduce(
    (suma, maintenance) => suma + maintenance.realizadas,
    0
  );
  const cumplimiento =
    programadas > 0 ? Math.round((realizadas / programadas) * 100) : null;

  const metricaDeHoy = diaActual
    ? (maintenances ?? []).find((maintenance) => maintenance.dia === diaActual)
    : undefined;
  const pendientesHoy = metricaDeHoy
    ? Math.max(0, metricaDeHoy.programadas - metricaDeHoy.realizadas)
    : 0;

  const kpis: Kpi[] = [
    {
      id: "stock",
      etiqueta: "Stock disponible",
      valor: String(stockTotal),
      detalle: `${metrics?.length ?? 0} tipos de producto`,
      tono: "neutral",
      icono: <Inventory2OutlinedIcon aria-hidden />,
    },
    {
      id: "bajoMinimo",
      etiqueta: "Bajo el mínimo",
      valor: String(productosBajoMinimo),
      detalle:
        productosBajoMinimo > 0
          ? "Toca para solicitar productos"
          : "Todo el stock está sobre el mínimo",
      tono: productosBajoMinimo > 0 ? "critical" : "good",
      icono:
        productosBajoMinimo > 0 ? (
          <ReportProblemOutlinedIcon aria-hidden />
        ) : (
          <CheckCircleOutlineIcon aria-hidden />
        ),
      onClick: productosBajoMinimo > 0 ? onVerBajoMinimo : undefined,
    },
    {
      id: "cumplimiento",
      etiqueta: "Cumplimiento semanal",
      valor: cumplimiento === null ? "—" : `${cumplimiento}%`,
      detalle:
        cumplimiento === null
          ? "Sin mantenciones programadas"
          : `${realizadas} de ${programadas} realizadas`,
      // 80% es el umbral con el que la semana se considera encaminada.
      tono:
        cumplimiento === null
          ? "neutral"
          : cumplimiento >= 80
            ? "good"
            : "warning",
      icono: <EventAvailableOutlinedIcon aria-hidden />,
    },
    {
      id: "pendientesHoy",
      etiqueta: "Pendientes hoy",
      valor: diaActual ? String(pendientesHoy) : "—",
      detalle: diaActual
        ? `Mantenciones del ${diaActual} sin registrar`
        : "Hoy no es día hábil",
      tono: !diaActual ? "neutral" : pendientesHoy > 0 ? "warning" : "good",
      icono: <PendingActionsOutlinedIcon aria-hidden />,
    },
  ];

  return (
    <section className={style.kpiRow} aria-label="Resumen del día">
      {kpis.map((kpi) => {
        const contenido = (
          <>
            <span className={style.kpiIcon}>{kpi.icono}</span>
            <span className={style.kpiLabel}>{kpi.etiqueta}</span>
            <strong className={style.kpiValue}>{kpi.valor}</strong>
            <span className={style.kpiDetail}>{kpi.detalle}</span>
          </>
        );

        const clases = `${style.kpiCard} ${style[`tono_${kpi.tono}`]}`;

        return kpi.onClick ? (
          <button
            key={kpi.id}
            type="button"
            className={`${clases} ${style.kpiCardButton}`}
            onClick={kpi.onClick}
          >
            {contenido}
          </button>
        ) : (
          <div key={kpi.id} className={clases}>
            {contenido}
          </div>
        );
      })}
    </section>
  );
};

export default HomeKpis;
