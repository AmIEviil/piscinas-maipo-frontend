import style from "./ActionsTable.module.css";

import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PencilIcon from "../../ui/Icons/PencilIcon";
import TrashIcon from "../../ui/Icons/TrashIcon";

export interface ActionsTdTableProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export const ActionsTdTable = ({
  onEdit,
  onView,
  onDelete,
}: ActionsTdTableProps) => {
  return (
    <div className={"flex items-center"}>
      {onView && (
        <Tooltip title="Ver detalles Vehículo" arrow leaveDelay={0}>
          <button className="actions" onClick={() => onView && onView()}>
            <VisibilityIcon />
          </button>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Editar Vehículo" arrow leaveDelay={0}>
          <button onClick={() => onEdit && onEdit()}>
            <PencilIcon />
          </button>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Eliminar Vehículo" arrow leaveDelay={0}>
          <button onClick={() => onDelete && onDelete()}>
            <TrashIcon className={style.iconAction} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
