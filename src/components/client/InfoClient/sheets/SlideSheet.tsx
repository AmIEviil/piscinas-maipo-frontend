import { useEffect, useLayoutEffect, useRef } from "react";
import style from "./SlideSheet.module.css";

interface SlideSheetProps {
  abierta: boolean;
  titulo: string;
  subtitulo?: string;
  /** Rotulo pequeno sobre el titulo, del tipo "Paso 1 de 2". */
  paso?: string;
  onCerrar: () => void;
  pie: React.ReactNode;
  children: React.ReactNode;
}

const FOCUSABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Raices que MUI porta fuera del arbol de la hoja: Select y Menu (via
 * Popover, que por dentro usa Modal) y Autocomplete/Tooltip/los popovers de
 * los DatePicker de MUI X (via Popper). Cuando Tasks 14 y 15 metan campos de
 * MUI dentro de `children`, sus listas y calendarios van a vivir fuera del
 * subarbol de `hojaRef` aunque el usuario los haya abierto desde adentro.
 */
const SELECTOR_POPOVER_MUI =
  '[class*="MuiPopover-root"], [class*="MuiModal-root"], [class*="MuiPopper-root"]';

/**
 * True si el elemento pertenece a un popover de MUI actualmente abierto: o
 * esta dentro de una de esas raices portadas a document.body (el menu de un
 * Select, el listado de un Autocomplete, el calendario de un DatePicker), o
 * es el <input> de un Autocomplete de MUI, que mantiene el foco real en si
 * mismo y solo marca aria-expanded="true" mientras su lista esta desplegada
 * (no mueve el foco al popover, asi que la primera condicion no lo agarra).
 *
 * La segunda rama exige ademas `.MuiAutocomplete-root` a proposito:
 * aria-expanded es un estado ARIA generico, no algo exclusivo de MUI, y este
 * proyecto tambien usa react-bootstrap (AccordionButton/Collapse lo ponen
 * igual). El propio MUI tiene el mismo problema puertas adentro: AccordionSummary
 * (@mui/material/AccordionSummary/AccordionSummary.js:163) pone
 * aria-expanded en su boton pero no escucha Escape en absoluto, asi que si
 * esta rama lo agarrara sin el ancla de clase, Escape se tragaria en
 * silencio sobre un acordeon expandido. El Autocomplete de MUI si se hace
 * cargo de su propio Escape
 * (@mui/material/useAutocomplete/useAutocomplete.js:722-729) y pone la clase
 * MuiAutocomplete-root en el div que envuelve tanto el <input> como el
 * popper (@mui/material/Autocomplete/autocompleteClasses.js:14 genera el
 * nombre; Autocomplete.js:664-670 lo aplica a AutocompleteRoot, que envuelve
 * a renderInput(); el <input> con aria-expanded sale de getInputProps() en
 * Autocomplete.js:714, dentro de ese mismo arbol) - por eso anclar a esa
 * clase distingue el Autocomplete real de cualquier otro control expandible
 * que tambien use aria-expanded.
 */
const enPopoverMui = (el: Element | null): boolean =>
  !!el &&
  (!!el.closest(SELECTOR_POPOVER_MUI) ||
    (el.getAttribute("aria-expanded") === "true" &&
      !!el.closest(".MuiAutocomplete-root")));

/**
 * Hoja deslizante sobre el modal de ficha del cliente.
 *
 * Entra por el costado derecho en escritorio y desde abajo en celular. Es un
 * dialogo dentro de otro dialogo, asi que se hace cargo de las tres cosas que
 * el modal padre no puede hacer por ella: atrapar el Tab, cerrar con Escape y
 * devolver el foco al elemento que la abrio.
 */
const SlideSheet = ({
  abierta,
  titulo,
  subtitulo,
  paso,
  onCerrar,
  pie,
  children,
}: SlideSheetProps) => {
  const hojaRef = useRef<HTMLDivElement | null>(null);
  const origenRef = useRef<HTMLElement | null>(null);

  // Recordar quien abrio la hoja, para devolverle el foco al cerrarla.
  //
  // useLayoutEffect, no useEffect: cuando abierta pasa a false, React ya
  // aplico aria-hidden="true" al subarbol de la hoja en el commit del DOM
  // de este mismo render. Si el foco todavia esta adentro (por ejemplo en
  // el boton de cerrar) y esperamos a un efecto pasivo -que React programa
  // para despues de que el navegador pueda pintar-, hay una ventana real en
  // la que el elemento enfocado queda dentro de un subarbol aria-hidden,
  // que la especificacion de ARIA prohibe explicitamente ("authors MUST NOT
  // use aria-hidden on a focused element"), y varios navegadores fuerzan un
  // blur a <body> en ese instante. useLayoutEffect corre de forma sincronica
  // justo despues de la mutacion del DOM y antes de que el navegador pinte,
  // asi que no hay frame intermedio en el que eso sea observable.
  useLayoutEffect(() => {
    if (abierta) {
      origenRef.current = document.activeElement as HTMLElement | null;
      const primero = hojaRef.current?.querySelector<HTMLElement>(FOCUSABLES);
      primero?.focus();
    } else {
      origenRef.current?.focus();
    }
  }, [abierta]);

  useEffect(() => {
    if (!abierta) return;

    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        if (enPopoverMui(document.activeElement)) {
          // El Escape le pertenece al popover de MUI que esta abierto (el
          // menu de un Select, el listado de un Autocomplete, el calendario
          // de un DatePicker): que lo cierre el, no nosotros. Si lo
          // intercepta el listener de la hoja, la hoja entera se cierra en
          // vez del popover, porque este listener es de captura y llega
          // primero que el propio manejador del popover.
          return;
        }
        evento.stopPropagation();
        onCerrar();
        return;
      }

      if (evento.key !== "Tab") return;

      const focusables = Array.from(
        hojaRef.current?.querySelectorAll<HTMLElement>(FOCUSABLES) ?? [],
      ).filter((el) => el.offsetParent !== null);

      if (focusables.length === 0) return;

      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];
      const activo = document.activeElement;

      if (evento.shiftKey && activo === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && activo === ultimo) {
        evento.preventDefault();
        primero.focus();
      } else if (!hojaRef.current?.contains(activo) && !enPopoverMui(activo)) {
        // Foco fuera de la hoja y fuera de un popover de MUI abierto desde
        // adentro: recien ahi es una fuga de verdad. Si el foco esta en un
        // Select/Menu/Autocomplete/DatePicker portado a document.body, no
        // hay que tocarlo - es el propio popover manejando su navegacion.
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alPresionar, true);
    return () => document.removeEventListener("keydown", alPresionar, true);
  }, [abierta, onCerrar]);

  return (
    <>
      <div
        className={style.velo}
        data-abierto={abierta ? "si" : "no"}
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div
        ref={hojaRef}
        className={style.hoja}
        data-abierto={abierta ? "si" : "no"}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        aria-hidden={abierta ? undefined : true}
      >
        <div className={style.cabecera}>
          <h2 className={style.titulo}>
            {paso && <span className={style.paso}>{paso}</span>}
            {titulo}
            {subtitulo && <small>{subtitulo}</small>}
          </h2>
          <button
            type="button"
            className={style.cerrar}
            onClick={onCerrar}
            aria-label={`Cerrar ${titulo}`}
          >
            &#10005;
          </button>
        </div>
        <div className={style.cuerpo}>{children}</div>
        <div className={style.pie}>{pie}</div>
      </div>
    </>
  );
};

export default SlideSheet;
