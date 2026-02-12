import style from "./ActionsTable.module.css";

import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PencilIcon from "../../ui/Icons/PencilIcon";
import TrashIcon from "../../ui/Icons/TrashIcon";
import DownloadIcon from "../../ui/Icons/DownloadIcon";

export interface ActionsTdTableProps {
  onViewTooltip?: string;
  onEditTooltip?: string;
  onDeleteTooltip?: string;
  onDownloadTooltip?: string;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  buttonClassName?: string;
}

export const ActionsTdTable = ({
  onViewTooltip = "Ver detalles",
  onEditTooltip = "Editar",
  onDeleteTooltip = "Eliminar",
  onDownloadTooltip = "Descargar",
  onEdit,
  onView,
  onDelete,
  onDownload,
  buttonClassName = "default",
}: ActionsTdTableProps) => {
  return (
    <div className={"flex items-center"}>
      {onView && (
        <Tooltip title={onViewTooltip} arrow leaveDelay={0}>
          <button
            className={buttonClassName}
            onClick={() => onView && onView()}
          >
            <VisibilityIcon />
          </button>
        </Tooltip>
      )}
      {onDownload && (
        <Tooltip title={onDownloadTooltip} arrow leaveDelay={0}>
          <button
            className={buttonClassName}
            onClick={() => onDownload && onDownload()}
          >
            <DownloadIcon size={24} />
          </button>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title={onEditTooltip} arrow leaveDelay={0}>
          <button
            className={buttonClassName}
            onClick={() => onEdit && onEdit()}
          >
            <PencilIcon />
          </button>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title={onDeleteTooltip} arrow leaveDelay={0}>
          <button
            className={buttonClassName}
            onClick={() => onDelete && onDelete()}
          >
            <TrashIcon className={style.iconAction} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
