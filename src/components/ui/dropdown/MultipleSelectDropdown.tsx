import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import style from "./MultipleSelect.module.css";
import "./Dropdown.css";
import CaretIcon from "../Icons/CaretIcon";
import ArrowIcon from "../Icons/ArrowIcon";
import CheckIcon from "../Icons/CheckIcon";

export interface DropdownOptions {
  value: string | number;
  label: string;
}

interface MultiSelectDropdownProps {
  options: DropdownOptions[];
  /**
   * En modo "multiple", labels separados por coma ("Lunes,Martes"). En modo
   * "single", el `value` de la opcion elegida.
   */
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  buttonClassName?: string;
  buttonContent?: React.ReactNode;
  arrowType?: "caret" | "arrow";
  /**
   * "multiple" (por defecto) acumula labels; "single" elige una opcion, cierra
   * el menu y devuelve su `value`.
   *
   * El modo por defecto se conserva tal cual estaba -- acumulando por label y
   * no por value- porque FieldGroup guarda justamente esa cadena de labels y
   * cambiarlo silenciosamente le romperia el guardado.
   */
  mode?: "multiple" | "single";
  /** Rotulo sobre el control. */
  title?: string;
  /** Clase del contenedor, para que quien lo monta decida como dimensionarlo. */
  containerClassName?: string;
  /** Id del boton. Igual que en CustomInputText: hace falta cuando el mismo
   * control se dibuja dos veces en la pagina. */
  toggleId?: string;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = "Seleccionar...",
  buttonClassName = "",
  buttonContent,
  arrowType = "caret",
  mode = "multiple",
  title,
  containerClassName = "",
  toggleId,
  disabled = false,
}) => {
  const [show, setShow] = useState(false);
  const esSimple = mode === "single";
  const idBoton = title ? (toggleId ?? `dropdown-${title}`) : undefined;

  const selectedValues = esSimple
    ? value
      ? [value]
      : []
    : value
      ? value.split(",")
      : [];

  // En simple se compara contra `value` y en multiple contra `label`: son dos
  // contratos distintos con el consumidor, no un detalle de presentacion.
  const estaSeleccionada = (option: DropdownOptions) =>
    esSimple
      ? String(option.value) === value
      : selectedValues.includes(option.label.toString());

  const elegir = (option: DropdownOptions) => {
    if (esSimple) {
      onSelect(String(option.value));
      setShow(false);
      return;
    }

    const label = option.label.toString();
    const updated = selectedValues.includes(label)
      ? selectedValues.filter((l) => l !== label)
      : [...selectedValues, label];

    onSelect(updated.join(","));
  };

  const displayLabel = esSimple
    ? (options.find((option) => String(option.value) === value)?.label ??
      placeholder)
    : selectedValues.length > 0
      ? options
          .filter((opt) => selectedValues.includes(opt.label.toString()))
          .map((opt) => opt.label)
          .join(", ")
      : placeholder;

  return (
    <Dropdown
      // Solo con rotulo se toma el contenedor en columna: FieldGroup monta
      // este control sin `title` dentro de su propia fila flex, y forzarle
      // width:100% ahi le cambiaria el layout sin que nadie lo haya pedido.
      className={`${title ? style.dropdown : ""} ${containerClassName}`}
      show={show}
      onToggle={(isOpen) => setShow(isOpen)}
      autoClose={esSimple ? true : "outside"}
    >
      {title && (
        <label className={style.dropdownTitle} htmlFor={idBoton}>
          {title}
        </label>
      )}
      <Dropdown.Toggle
        as="button"
        type="button"
        id={idBoton}
        disabled={disabled}
        className={`${buttonClassName} ${style.customDropdownToggle}`}
        onClick={(e) => {
          e.preventDefault();
          setShow(!show);
        }}
      >
        <span className={style.toggleLabel}>{buttonContent ?? displayLabel}</span>
        {arrowType === "caret" ? (
          <CaretIcon
            size={16}
            direction={show ? "up" : "down"}
            className="ml-2"
          />
        ) : (
          <ArrowIcon
            size={16}
            direction={show ? "up" : "down"}
            className="ml-2"
          />
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className={`${style.customMenuDropdown} custom-scrollbar`}
        align="start"
      >
        {options.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={(e) => {
              e.preventDefault();
              elegir(option);
            }}
            active={estaSeleccionada(option)}
          >
            <span className="flex items-center justify-between w-full">
              {option.label}
              {estaSeleccionada(option) && <CheckIcon size={16} color="#006CD9" />}
            </span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MultiSelectDropdown;
