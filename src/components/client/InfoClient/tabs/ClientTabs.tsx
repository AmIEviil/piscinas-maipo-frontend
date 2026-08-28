import { useRef } from "react";
import style from "./ClientTabs.module.css";

export type PestanaId = "mantenciones" | "cobros" | "ficha";

interface ClientTabsProps {
  activa: PestanaId;
  onCambiar: (id: PestanaId) => void;
  conteos: { mantenciones: number; cobros: number };
  /**
   * Oculta la pestana Cobros por completo (no solo su contenido). Pensada
   * para el no-superadmin: antes del rediseno esa seccion directamente no
   * se renderizaba, y una pestana presente-pero-inerte (sin `disabled`, sin
   * `aria-disabled`, foco de teclado aterrizando ahi igual) no reproducia
   * eso para mouse, teclado ni lector de pantalla. Opcional: quien no lo
   * pase (p. ej. Task 16 todavia) sigue viendo las tres pestanas de siempre.
   */
  ocultarCobros?: boolean;
}

const PESTANAS: { id: PestanaId; etiqueta: string }[] = [
  { id: "mantenciones", etiqueta: "Mantenciones" },
  { id: "cobros", etiqueta: "Cobros" },
  { id: "ficha", etiqueta: "Ficha" },
];

/**
 * Tablist del modal.
 *
 * Reemplaza los cuatro colapsables anidados que habia antes, cada uno con su
 * propio estilo de boton. Navegacion por teclado completa: flechas para
 * moverse, Inicio y Fin para los extremos, y solo la pestana activa participa
 * del orden de tabulacion.
 *
 * Con `ocultarCobros`, esa pestana se excluye de la lista que se renderiza Y
 * de la lista sobre la que viaja el teclado: no basta con esconderla
 * visualmente, porque `alPresionar` movia el foco real del DOM a cualquier
 * boton de `PESTANAS` sin mirar si estaba montado. Al filtrar antes de
 * calcular indices, la aritmetica de ArrowRight/ArrowLeft/Home/End queda
 * automaticamente correcta para las pestanas que sí existen.
 */
const ClientTabs = ({ activa, onCambiar, conteos, ocultarCobros = false }: ClientTabsProps) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pestanas = ocultarCobros
    ? PESTANAS.filter((pestana) => pestana.id !== "cobros")
    : PESTANAS;

  const alPresionar = (evento: React.KeyboardEvent, indice: number) => {
    const ultimo = pestanas.length - 1;
    let destino: number | null = null;

    if (evento.key === "ArrowRight") destino = (indice + 1) % pestanas.length;
    if (evento.key === "ArrowLeft") destino = (indice - 1 + pestanas.length) % pestanas.length;
    if (evento.key === "Home") destino = 0;
    if (evento.key === "End") destino = ultimo;

    if (destino === null) return;
    evento.preventDefault();
    onCambiar(pestanas[destino].id);
    refs.current[destino]?.focus();
  };

  const conteoDe = (id: PestanaId) =>
    id === "mantenciones" ? conteos.mantenciones : id === "cobros" ? conteos.cobros : null;

  return (
    <div
      className={style.pestanas}
      role="tablist"
      aria-label="Secciones de la ficha del cliente"
    >
      {pestanas.map((pestana, indice) => {
        const seleccionada = pestana.id === activa;
        const conteo = conteoDe(pestana.id);
        return (
          <button
            key={pestana.id}
            ref={(el) => {
              refs.current[indice] = el;
            }}
            type="button"
            role="tab"
            id={`pestana-${pestana.id}`}
            aria-controls={`panel-${pestana.id}`}
            aria-selected={seleccionada}
            tabIndex={seleccionada ? 0 : -1}
            className={style.pestana}
            onClick={() => onCambiar(pestana.id)}
            onKeyDown={(evento) => alPresionar(evento, indice)}
          >
            {pestana.etiqueta}
            {conteo !== null && conteo > 0 && (
              <span className={style.conteo}>{conteo}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ClientTabs;
