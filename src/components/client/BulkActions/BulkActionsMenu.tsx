import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import type { CampoBulkCliente } from "../../../service/client.interface";
import style from "./BulkActions.module.css";

/** Acciones del menu: un campo del cambio masivo generico o el alza de valor. */
export type AccionBulkCliente = CampoBulkCliente | "valor_mantencion";

interface BulkActionsMenuProps {
  /** Cuantos clientes hay seleccionados; solo se usa para el texto de ayuda. */
  cantidad: number;
  onSelectAccion: (accion: AccionBulkCliente) => void;
}

const ACCIONES: Array<{
  accion: AccionBulkCliente;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    accion: "frecuencia_mantencion_id",
    label: "Cambiar periodicidad de visitas",
    icon: <EventRepeatIcon fontSize="small" />,
  },
  {
    accion: "dia_mantencion",
    label: "Cambiar día de mantención",
    icon: <CalendarMonthIcon fontSize="small" />,
  },
  {
    accion: "ruta",
    label: "Cambiar ruta",
    icon: <AltRouteIcon fontSize="small" />,
  },
  {
    accion: "valor_mantencion",
    label: "Modificar valor mantención",
    icon: <PaidOutlinedIcon fontSize="small" />,
  },
];

/**
 * Boton de acciones en bloque que acompana al aviso de "Ver detalles de N
 * cliente(s)".
 *
 * Vive pegado a ese aviso a proposito: es el unico lugar de la vista donde el
 * usuario ya sabe cuantos clientes tiene seleccionados, y las tres acciones
 * operan justamente sobre esa seleccion.
 */
export const BulkActionsMenu = ({
  cantidad,
  onSelectAccion,
}: BulkActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const abierto = Boolean(anchorEl);

  const handleSelect = (accion: AccionBulkCliente) => {
    setAnchorEl(null);
    onSelectAccion(accion);
  };

  return (
    <>
      <button
        type="button"
        className={style.trigger}
        onClick={(evento) => setAnchorEl(evento.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Acciones para ${cantidad} cliente(s) seleccionado(s)`}
        title="Acciones para los clientes seleccionados"
      >
        <ChevronRightIcon
          fontSize="small"
          className={`${style.triggerIcon} ${abierto ? style.triggerIconAbierto : ""}`}
        />
      </button>

      <Menu
        anchorEl={anchorEl}
        open={abierto}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ list: { dense: false } }}
      >
        {ACCIONES.map((accion) => (
          <MenuItem
            key={accion.accion}
            onClick={() => handleSelect(accion.accion)}
            className={style.opcion}
          >
            <ListItemIcon>{accion.icon}</ListItemIcon>
            {accion.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default BulkActionsMenu;
