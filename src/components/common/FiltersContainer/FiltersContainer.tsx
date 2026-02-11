/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import style from "./FitlersContainer.module.css";
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
  return (
    <div className={style.filtersContainer}>
      <div className={style.filters}>
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
            <button onClick={button.onClick} className={style.actionButton}>
              {button.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
