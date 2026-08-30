import { useRef, type KeyboardEvent } from "react";
import style from "./ChartViewToggle.module.css";
import { CHART_VIEW_OPTIONS, type ChartView } from "./chartViews";

interface ChartViewToggleProps {
  value: ChartView;
  onChange: (vista: ChartView) => void;
  /** Nombre de la seccion, para que el lector de pantalla sepa que se cambia. */
  etiquetaGrupo: string;
}

const TECLAS_SIGUIENTE = ["ArrowRight", "ArrowDown"];
const TECLAS_ANTERIOR = ["ArrowLeft", "ArrowUp"];

/**
 * Selector de vista de una seccion del Home.
 *
 * Es un grupo de radio y no una fila de botones sueltos: son opciones
 * excluyentes, asi el lector de pantalla anuncia cual esta activa y las flechas
 * recorren el grupo. Con tabindex movil solo la opcion activa entra en el orden
 * de tabulacion, que es lo que espera un radiogroup; por eso el movimiento con
 * flechas se implementa a mano, sin el no habria forma de llegar al resto.
 */
const ChartViewToggle = ({
  value,
  onChange,
  etiquetaGrupo,
}: ChartViewToggleProps) => {
  const grupoRef = useRef<HTMLDivElement>(null);

  const moverFoco = (indice: number) => {
    const opcion = CHART_VIEW_OPTIONS[indice];
    onChange(opcion.value);
    // El boton destino todavia no tiene tabIndex 0 en este tick, pero focus()
    // no lo necesita.
    const botones = grupoRef.current?.querySelectorAll("button");
    botones?.[indice]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const actual = CHART_VIEW_OPTIONS.findIndex(
      (opcion) => opcion.value === value
    );
    if (actual === -1) return;

    const total = CHART_VIEW_OPTIONS.length;
    if (TECLAS_SIGUIENTE.includes(event.key)) {
      event.preventDefault();
      moverFoco((actual + 1) % total);
    } else if (TECLAS_ANTERIOR.includes(event.key)) {
      event.preventDefault();
      moverFoco((actual - 1 + total) % total);
    } else if (event.key === "Home") {
      event.preventDefault();
      moverFoco(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moverFoco(total - 1);
    }
  };

  return (
    <div
      ref={grupoRef}
      className={style.toggleGroup}
      role="radiogroup"
      aria-label={`Tipo de vista para ${etiquetaGrupo}`}
      onKeyDown={handleKeyDown}
    >
      {CHART_VIEW_OPTIONS.map((opcion) => {
        const activa = opcion.value === value;
        return (
          <button
            key={opcion.value}
            type="button"
            role="radio"
            aria-checked={activa}
            tabIndex={activa ? 0 : -1}
            title={opcion.descripcion}
            className={`${style.toggleButton} ${
              activa ? style.toggleButtonActive : ""
            }`}
            onClick={() => onChange(opcion.value)}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
};

export default ChartViewToggle;
