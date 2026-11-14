import type {
  ComponentProps,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useMemo, useState } from "react";
import CustomCalendarV2 from "../calendar/CustomCalendarV2";
import style from "./FormSheet.module.css";

const unir = (...clases: (string | false | undefined)[]) =>
  clases.filter(Boolean).join(" ");

/* -------------------------------------------------------------------------
 * Campos de la familia FormSheet.
 *
 * Todos son controles nativos con la clase `.control` (misma que la hoja de
 * mantencion y la ficha del cliente): en iPhone el <select> abre el picker
 * del sistema en vez de un menu de MUI portado, el teclado respeta
 * inputMode/type, y el tamano de letra minimo de 1rem evita el zoom
 * automatico de Safari al enfocar.
 * ---------------------------------------------------------------------- */

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

/** Tarjeta con titulo que agrupa campos en una grilla de 1 o 2 columnas. */
export const FormSection = ({ title, icon, children }: FormSectionProps) => (
  <section className={style.seccion}>
    <h3 className={style.seccionTitulo}>
      {icon && (
        <span className={style.seccionIcono} aria-hidden="true">
          {icon}
        </span>
      )}
      {title}
    </h3>
    <div className={style.grilla}>{children}</div>
  </section>
);

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  /** Texto chico a la derecha del rotulo, p. ej. "(opcional)". */
  hint?: string;
  error?: string;
  /** Ocupa las dos columnas de la grilla. */
  full?: boolean;
  children: ReactNode;
}

export const FormField = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  full,
  children,
}: FormFieldProps) => (
  <div className={unir(style.campo, full && style.anchoCompleto)}>
    <label className={style.rotulo} htmlFor={htmlFor}>
      {label}
      {required && (
        <span className={style.requerido} aria-hidden="true">
          *
        </span>
      )}
      {hint && <span className={style.pista}>{hint}</span>}
    </label>
    {children}
    {error && (
      <span className={style.error} role="alert">
        {error}
      </span>
    )}
  </div>
);

/** Celda de la grilla sin rotulo propio (p. ej. CustomCalendarV2, que trae el suyo). */
export const FormCell = ({
  full,
  children,
}: {
  full?: boolean;
  children: ReactNode;
}) => (
  <div className={unir(style.campo, full && style.anchoCompleto)}>
    {children}
  </div>
);

export const FormInput = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={unir(style.control, className)} />
);

export const FormTextarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={unir(style.control, style.areaTexto, className)}
  />
);

export interface FormOption {
  value: string | number;
  label: string;
}

interface FormSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: FormOption[];
  /** Opcion vacia inicial ("Elegir..."). Se omite si no se pasa. */
  placeholder?: string;
}

export const FormSelect = ({
  options,
  placeholder,
  className,
  ...props
}: FormSelectProps) => (
  <select {...props} className={unir(style.control, className)}>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((opcion) => (
      <option key={String(opcion.value)} value={opcion.value}>
        {opcion.label}
      </option>
    ))}
  </select>
);

// Sin tildes y en minusculas, igual que el buscador de CustomSelect.
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

interface FormSearchSelectProps extends FormSelectProps {
  id: string;
  searchPlaceholder?: string;
}

/**
 * Select nativo con un buscador encima, para listas largas (p. ej. ~160
 * clientes). El buscador solo filtra las opciones; el valor se elige siempre
 * en el picker del sistema, asi que nunca se guarda texto suelto como valor.
 * La opcion ya elegida se mantiene aunque el filtro la deje fuera.
 */
export const FormSearchSelect = ({
  id,
  options,
  value,
  searchPlaceholder = "Buscar...",
  ...props
}: FormSearchSelectProps) => {
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const termino = normalizar(busqueda);
    if (!termino) return options;
    return options.filter(
      (opcion) =>
        normalizar(opcion.label).includes(termino) ||
        String(opcion.value) === String(value ?? ""),
    );
  }, [options, busqueda, value]);

  return (
    <div className={style.busqueda}>
      <input
        type="search"
        className={style.control}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        aria-controls={id}
        autoComplete="off"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <FormSelect {...props} id={id} value={value} options={visibles} />
      {busqueda && (
        <span className={style.pista} aria-live="polite">
          {visibles.length} resultado{visibles.length === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
};

interface FormToggleProps {
  name: string;
  value: boolean;
  onChange: (valor: boolean) => void;
  labelYes?: string;
  labelNo?: string;
}

/** Par Si/No grande, mismo control que "¿Se realizo?" en la hoja de mantencion. */
export const FormToggle = ({
  name,
  value,
  onChange,
  labelYes = "Sí",
  labelNo = "No",
}: FormToggleProps) => (
  <div className={style.opciones} role="radiogroup">
    <label className={style.opcion}>
      <input
        type="radio"
        name={name}
        checked={value}
        onChange={() => onChange(true)}
      />
      <span>✓ {labelYes}</span>
    </label>
    <label className={unir(style.opcion, style.opcionNo)}>
      <input
        type="radio"
        name={name}
        checked={!value}
        onChange={() => onChange(false)}
      />
      <span>✕ {labelNo}</span>
    </label>
  </div>
);

type FormDateProps = Omit<
  ComponentProps<typeof CustomCalendarV2>,
  "customClassName"
> & { full?: boolean; error?: string };

/**
 * Fecha con CustomCalendarV2 (trae su propio rotulo; `require` pinta el *).
 * Su popup se porta a <body> marcado con data-portal-popup, compatible con
 * el enforceFocus={false} de FormSheet.
 */
export const FormDate = ({ full, error, ...props }: FormDateProps) => (
  <FormCell full={full}>
    <CustomCalendarV2 {...props} customClassName={style.calendario} />
    {error && (
      <span className={style.error} role="alert">
        {error}
      </span>
    )}
  </FormCell>
);
