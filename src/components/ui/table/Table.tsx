import React from "react";
import style from "./TableStyle.module.css"; // opcional, si usas estilos
import CircularProgress from "@mui/material/CircularProgress";
interface Title {
  label: string;
  showOrderBy?: boolean;
}

interface TableGenericProps<T> {
  titles: Title[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
  loading?: boolean;
  textNotFound?: string;
}

const TableGeneric = <T,>({
  titles,
  data,
  renderRow,
  loading,
  textNotFound = "prueba",
}: TableGenericProps<T>) => {
  return (
    <div className={style.tableContainer}>
      <div>
        <table>
          <thead>
            <tr>
              {titles.map((title, index) => (
                <th key={index}>
                  {title.label}
                  {title.showOrderBy && <span>▼</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{data.length > 0 && data.map(renderRow)}</tbody>
        </table>
        {loading && <CircularProgress className={style.iconTd} />}
        {!data.length && !loading && (
          <ul>
            <span>No se econtraron resultados {textNotFound}</span>
            <li>Revisa la ortografia</li>
            <li>Intenta buscar por otra palabra</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default TableGeneric;
