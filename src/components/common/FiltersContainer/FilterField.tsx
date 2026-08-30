/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from "react";
import CustomInputText from "../../ui/InputText/CustomInputText";
import MultiSelectDropdown, {
  type DropdownOptions,
} from "../../ui/dropdown/MultipleSelectDropdown";
import Calendar from "../../ui/datepicker/DatePicker";

export interface FilterItem {
  title: string;
  placeholder?: string;
  type: "text" | "select" | "date" | "boolean";
  typeCalendar?: "day" | "range";
  options?: { label: string; value: string | boolean }[];
  value: string | boolean | null | number | (Date | null)[];
  onChange: (value: string | boolean | null) => void;
}

/**
 * Campo de texto de un filtro.
 *
 * Guarda lo tecleado en estado propio y solo despues lo empuja hacia arriba.
 * `CustomInputText` es un controlado puro -pinta exactamente el `value` que
 * recibe-, y los filtros de texto de las vistas estan detras de un setter
 * debounceado que ademas ignora las cadenas de menos de tres caracteres: sin
 * este eco local, el `value` que vuelve sigue vacio y el campo se ve congelado
 * mientras se escribe. `InputText`, el que se usaba antes, escondia su propio
 * estado adentro y por eso no se notaba.
 */
const FilterTextField: React.FC<{
  filter: FilterItem;
  containerClassName?: string;
  campoId: string;
}> = ({ filter, containerClassName, campoId }) => {
  const valorExterno = typeof filter.value === "string" ? filter.value : "";
  const [texto, setTexto] = useState(valorExterno);

  // Resincroniza cuando el filtro cambia desde afuera (limpiar filtros, un
  // filtro llegado del Home). No pisa lo que se esta escribiendo: mientras el
  // usuario teclea, `valorExterno` o coincide o esta vacio a proposito.
  useEffect(() => {
    setTexto(valorExterno);
  }, [valorExterno]);

  return (
    <CustomInputText
      type="text"
      customClassContainer={containerClassName}
      inputId={campoId}
      title={filter.title}
      placeholder={filter.placeholder}
      value={texto}
      onChange={(value: string) => {
        setTexto(value);
        filter.onChange(value);
      }}
    />
  );
};

/**
 * Un control de filtro.
 *
 * Vive aparte de FiltersContainer porque la hoja de busqueda avanzada dibuja
 * exactamente los mismos controles fuera de la barra: tenerlos en un solo
 * lugar evita que un filtro se comporte distinto segun donde aparezca.
 */
const FilterField: React.FC<{
  filter: FilterItem;
  /**
   * Clase del contenedor. La barra de filtros es una fila y le pasa
   * `input-text-block` (crece con el espacio, minimo 12rem); la hoja de
   * busqueda avanzada es una columna y no pasa nada, porque ahi ese mismo
   * flex-basis se interpretaria como ALTO y dejaria campos de 12rem de alto.
   */
  containerClassName?: string;
  /**
   * Prefijo de los ids de los controles. Cada filtro se dibuja dos veces -en
   * la barra y en la hoja de busqueda avanzada-, y sin prefijo los dos
   * ejemplares comparten id: las etiquetas de la hoja terminan apuntando al
   * control de la barra, que ademas esta oculto.
   */
  scope?: string;
}> = ({ filter, containerClassName, scope = "filtro" }) => {
  const campoId = `${scope}-${filter.title}`;

  switch (filter.type) {
    case "text":
      return (
        <FilterTextField
          filter={filter}
          containerClassName={containerClassName}
          campoId={campoId}
        />
      );
    case "select":
      return (
        <MultiSelectDropdown
          // mode="single": el dropdown nacio multi-seleccion y acumulando
          // labels; un filtro elige una opcion y necesita su `value` (la
          // periodicidad filtra por uuid, que no se parece en nada a su
          // etiqueta).
          mode="single"
          title={filter.title}
          containerClassName={containerClassName}
          toggleId={campoId}
          placeholder={filter.placeholder ?? "Seleccionar..."}
          options={(filter.options as DropdownOptions[]) || []}
          value={filter.value == null ? "" : String(filter.value)}
          onSelect={(value) => filter.onChange(value)}
        />
      );
    case "date":
      if (filter.typeCalendar === "range") {
        return (
          <Calendar
            title={filter.title}
            mode="range"
            label={filter.placeholder}
            initialValue={
              filter.value && Array.isArray(filter.value)
                ? [
                    filter.value[0] instanceof Date
                      ? new Date(filter.value[0])
                      : new Date(),
                    filter.value[1] instanceof Date
                      ? new Date(filter.value[1])
                      : new Date(),
                  ]
                : undefined
            }
            onChange={({ start, end }) =>
              filter.onChange([start, end] as unknown as string | null)
            }
          />
        );
      }
      return (
        <Calendar
          title={filter.title}
          label={filter.placeholder}
          mode="day"
          initialValue={
            filter.value && Array.isArray(filter.value)
              ? (filter.value[0] as Date)
              : // @ts-ignore
                filter.value && filter.value instanceof Date
                ? new Date(filter.value as Date)
                : new Date()
          }
          onChange={({ start }) =>
            filter.onChange(start as unknown as string | null)
          }
        />
      );
    default:
      return null;
  }
};

export default FilterField;
