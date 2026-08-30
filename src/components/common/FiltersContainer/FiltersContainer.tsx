import React, { useState } from "react";
import style from "./FitlersContainer.module.css";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Tooltip from "@mui/material/Tooltip";
import FilterField, { type FilterItem } from "./FilterField";

export type { FilterItem };

interface ActionButton {
  titleTooltip: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export interface FiltersContainerProps {
  filters: FilterItem[];
  actionButtons?: ActionButton[];
  /**
   * Controles extra al final de la fila de filtros, con el mismo alineado que
   * los campos. Lo usa BodyClients para el boton de busqueda avanzada, que
   * necesita texto y no cabe en `actionButtons` (solo iconos).
   */
  extraControls?: React.ReactNode;
}

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  filters,
  actionButtons = [],
  extraControls,
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
        {filters.map((filter, index) => (
          <FilterField
            key={filter.title + index}
            filter={filter}
            containerClassName="input-text-block"
            scope="barra"
          />
        ))}
        {extraControls}
      </div>
      <div className={style.actionsFilters}>
        {actionButtons.map((button, index) => (
          <Tooltip
            title={button.titleTooltip}
            arrow
            leaveDelay={0}
            key={button.titleTooltip + index}
          >
            <button
              onClick={button.onClick}
              className={style.actionButton}
              disabled={button.disabled}
            >
              {button.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
