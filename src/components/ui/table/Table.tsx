import React from "react";
import style from "./TableStyle.module.css";
import CircularProgress from "@mui/material/CircularProgress";
import CaretIcon from "../Icons/CaretIcon";
import OrderIcon from "../Icons/OrderIcon";
interface Title {
  label: string;
  key: string;
  icon?: React.ReactNode;
  showOrder?: boolean;
  minWidth?: string;
  maxWidth?: string;
  className?: string;
}

interface TableGenericProps<T> {
  titles: Title[];
  data: T[];
  renderHeader?: (title: Title, index: number) => React.ReactNode;
  renderRow: (item: T) => React.ReactNode;
  loading?: boolean;
  textNotFound?: string;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
  onOrderChange?: (key: string, order: "ASC" | "DESC") => void;
}

type CellElement = React.ReactElement<{ "data-label"?: string }>;
type RowElement = React.ReactElement<{ children?: React.ReactNode }>;

const TableGeneric = <T,>({
  titles,
  data,
  renderRow,
  loading,
  textNotFound = "Sin Resultados",
  renderHeader,
  orderBy,
  orderDirection,
  onOrderChange,
}: TableGenericProps<T>) => {
  const handleOrderChange = (key: string) => {
    if (!onOrderChange) return;

    let direction: "ASC" | "DESC" = "ASC";
    if (orderBy === key && orderDirection === "ASC") {
      direction = "DESC";
    }

    onOrderChange(key, direction);
  };

  /**
   * En celular la tabla se muestra como tarjetas: cada fila es un bloque y
   * cada celda lleva su titulo al lado. Para eso cada <td> necesita saber a
   * que columna pertenece, y el CSS lo lee con attr(data-label).
   *
   * La etiqueta se inyecta aca en lugar de pedirsela a cada renderRow del
   * proyecto: son mas de diez tablas y todas ya reciben sus titulos por props.
   */
  const withCellLabels = (row: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(row)) return row;

    const rowElement = row as RowElement;
    const cells = React.Children.toArray(rowElement.props.children).map(
      (cell, index) => {
        if (!React.isValidElement(cell)) return cell;
        const cellElement = cell as CellElement;
        if (cellElement.props["data-label"] !== undefined) return cellElement;

        const label = titles[index]?.label;
        if (!label) return cellElement;

        return React.cloneElement(cellElement, { "data-label": label });
      }
    );

    return React.cloneElement(rowElement, undefined, cells);
  };

  return (
    <div className={`${style.tableContainer} custom-scrollbar`}>
      <div>
        <table>
          <thead>
            <tr>
              {titles.map((title, index) =>
                renderHeader ? (
                  renderHeader(title, index)
                ) : (
                  <th key={title.label + index}>
                    <span className="flex flex-row items-center gap-2">
                      {title.label}
                      {title.showOrder && (
                        <button
                          onClick={() => handleOrderChange(title.key)}
                          className="focus:outline-none normal"
                          aria-label={`Ordenar por ${title.label}`}
                        >
                          {orderBy === title.key ? (
                            <CaretIcon
                              direction={
                                orderDirection === "ASC" ? "up" : "down"
                              }
                              size={14}
                              className="ml-1"
                              color="#00B398"
                            />
                          ) : (
                            <OrderIcon
                              className={`${style.orderIcon} text-gray-600`}
                              size={16}
                            />
                          )}
                        </button>
                      )}
                    </span>
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              !loading &&
              data.map((item) => withCellLabels(renderRow(item)))}
          </tbody>
        </table>
        {loading && <CircularProgress className={style.iconTd} />}
        {!data.length && !loading && (
          <ul className={style.noData}>
            <span>{textNotFound}</span>
            <li>Revisa la ortografia</li>
            <li>Intenta buscar por otra palabra</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default TableGeneric;
