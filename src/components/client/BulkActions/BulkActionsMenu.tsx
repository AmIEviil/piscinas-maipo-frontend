import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import type { CampoBulkCliente } from "../../../service/client.interface";
import style from "./BulkActions.module.css";

interface BulkActionsMenuProps {
  /** Cuantos clientes hay seleccionados; solo se usa para el texto de ayuda. */
  cantidad: number;
  onSelectCampo: (campo: CampoBulkCliente) => void;
}

const ACCIONES: Array<{
  campo: CampoBulkCliente;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    campo: "frecuencia_mantencion_id",
    label: "Cambiar periodicidad de visitas",
    icon: <EventRepeatIcon fontSize="small" />,
  },
  {
    campo: "dia_mantencion",
    label: "Cambiar día de mantención",
    icon: <CalendarMonthIcon fontSize="small" />,
  },
  {
    campo: "ruta",
    label: "Cambiar ruta",
    icon: <AltRouteIcon fontSize="small" />,
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
  onSelectCampo,
}: BulkActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const abierto = Boolean(anchorEl);

  const handleSelect = (campo: CampoBulkCliente) => {
    setAnchorEl(null);
    onSelectCampo(campo);
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
            key={accion.campo}
            onClick={() => handleSelect(accion.campo)}
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
