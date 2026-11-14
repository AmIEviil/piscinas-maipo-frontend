import type { ReactNode } from "react";
import { Modal } from "react-bootstrap";
import style from "./FormSheet.module.css";

interface FormSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Linea secundaria bajo el titulo (p. ej. el nombre del registro editado). */
  subtitle?: string;
  /** Botones del pie. Quedan fijos abajo mientras el cuerpo hace scroll. */
  footer: ReactNode;
  children: ReactNode;
  /** Ancho en escritorio. En celular siempre ocupa la pantalla completa. */
  size?: "md" | "lg" | "xl";
}

/**
 * Contenedor comun de los formularios de alta/edicion (cliente, empleado,
 * producto, reparacion, revestimiento, vehiculo).
 *
 * Replica el lenguaje visual de la ficha del cliente y de la hoja de
 * mantencion: cabecera de color fija, cuerpo con scroll propio sobre
 * --modal-lienzo y pie fijo con las acciones. En celular el modal ya va a
 * pantalla completa por responsive.css; aca se garantiza que el pie no se
 * pierda bajo el teclado ni bajo la barra de inicio del iPhone.
 *
 * enforceFocus={false} NO es opcional. Sin el, el focus trap de Bootstrap y
 * el de cualquier capa portada a <body> (menu de un Select de MUI, popover
 * de un DatePicker, popup de CustomCalendarV2) se devuelven el foco entre si
 * en un bucle: en iOS Safari eso congelaba la app varios segundos al abrir
 * un select del formulario de clientes. Los campos de esta familia
 * (FormFields.tsx) ademas usan <select> nativo, que en iPhone abre el picker
 * del sistema y no porta nada.
 *
 * animation={false}: misma razon que InfoDialogClient.tsx, el respaldo de
 * transitionend de react-bootstrap se cancela con transiciones de
 * descendientes y el modal puede quedar montado e invisible.
 */
const FormSheet = ({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  size = "lg",
}: FormSheetProps) => (
  <Modal
    show={open}
    onHide={onClose}
    size={size === "md" ? undefined : size}
    centered
    // Un toque fuera del formulario no debe descartar lo ya escrito: se
    // cierra con la X, Cancelar o Escape.
    backdrop="static"
    enforceFocus={false}
    animation={false}
    contentClassName={style.hoja}
    aria-label={title}
  >
    <header className={style.cabecera}>
      <div className={style.textoCabecera}>
        <h2 className={style.titulo}>{title}</h2>
        {subtitle && <p className={style.subtitulo}>{subtitle}</p>}
      </div>
      <button
        type="button"
        className={style.cerrar}
        onClick={onClose}
        aria-label={`Cerrar ${title}`}
      >
        &#10005;
      </button>
    </header>
    <div className={style.cuerpo}>{children}</div>
    <footer className={style.pie}>{footer}</footer>
  </Modal>
);

export default FormSheet;
