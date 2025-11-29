import React from "react";
import style from "./TableStyle.module.css"; // opcional, si usas estilos
import CircularProgress from "@mui/material/CircularProgress";
import CaretIcon from "../Icons/CaretIcon";
interface Title {
  label: string;
  showOrderBy?: boolean;
  minWidth?: string;
  maxWidth?: string;
}

interface TableGenericProps<T> {
  titles: Title[];
  data: T[];
  renderHeader?: (title: Title, index: number) => React.ReactNode;
  renderRow: (item: T) => React.ReactNode;
  loading?: boolean;
  textNotFound?: string;
}

const TableGeneric = <T,>({
  titles,
  data,
  renderRow,
  loading,
  textNotFound = "Sin Resultados",
  renderHeader,
}: TableGenericProps<T>) => {
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
                  <th key={index}>
                    <span className="flex flex-row items-center gap-2">
                      {title.label}
                      {title.showOrderBy && <CaretIcon color="#0289c7" />}
                    </span>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>{data.length > 0 && !loading && data.map(renderRow)}</tbody>
        </table>
        {loading && <CircularProgress className={style.iconTd} />}
        {!data.length && !loading && (
          <ul className="flex flex-col items-start p-4 gap-2 text-lg">
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
