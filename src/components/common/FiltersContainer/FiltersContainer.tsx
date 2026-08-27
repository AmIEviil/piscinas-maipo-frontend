/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from "react";
import style from "./FitlersContainer.module.css";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InputText from "../../ui/InputText/InputText";
import CustomSelect, { type IOptionsSelect } from "../../ui/Select/Select";
import Tooltip from "@mui/material/Tooltip";
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

interface ActionButton {
  titleTooltip: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export interface FiltersContainerProps {
  filters: FilterItem[];
  actionButtons?: ActionButton[];
}
export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  filters,
  actionButtons = [],
}) => {
  /**
   * En celular los filtros ocupan casi toda la pantalla y empujan la tabla
   * fuera de vista. Se colapsan detras de un boton, que solo aparece por
   * debajo de 768px; en tablet y escritorio los filtros siguen siempre
   * visibles y este estado no se usa.
   */
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className={style.filtersContainer}>
      <button
        type="button"
        className={style.toggleFiltersButton}
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
      >
        {filtersOpen ? <ExpandLessIcon /> : <FilterListIcon />}
        {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
      </button>

      <div
        className={`${style.filters} ${filtersOpen ? style.filtersOpen : ""}`}
      >
        {filters.map((filter, index) => {
          switch (filter.type) {
            case "text":
              return (
                <InputText
                  key={filter.title + index}
                  title={filter.title}
                  placeholder={filter.placeholder}
                  value={typeof filter.value === "string" ? filter.value : ""}
                  onChange={(value: string) => filter.onChange(value)}
                />
              );
            case "select":
              return (
                <CustomSelect
                  label={filter.title}
                  options={(filter.options as IOptionsSelect[]) || []}
                  onChange={(event) =>
                    filter.onChange(String(event.target.value))
                  }
                  value={filter.value as string | number | undefined}
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
        })}
      </div>
      <div className={style.actionsFilters}>
        {actionButtons.map((button, index) => (
          <Tooltip
            title={button.titleTooltip}
            arrow
            leaveDelay={0}
            key={button.titleTooltip + index}
          >
            <button onClick={button.onClick} className={style.actionButton} disabled={button.disabled}  >
              {button.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
