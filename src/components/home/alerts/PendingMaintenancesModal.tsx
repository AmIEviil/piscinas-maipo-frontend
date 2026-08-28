import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { HORA_ALERTA_MANTENCIONES } from "../../../utils/homeAlertsUtils";

interface PendingMaintenancesModalProps {
  open: boolean;
  dia: string;
  faltantes: number;
  onAceptar: () => void;
  onIrARegistrar: () => void;
}

/**
 * Recordatorio de fin de jornada: a esta hora las mantenciones del dia ya
 * deberian estar cargadas. "Ir a registrar" deja Clientes filtrado por el dia
 * y con todos los clientes seleccionados.
 */
const PendingMaintenancesModal = ({
  open,
  dia,
  faltantes,
  onAceptar,
  onIrARegistrar,
}: PendingMaintenancesModalProps) => (
  <Dialog open={open} onClose={onAceptar} maxWidth="xs" fullWidth>
    <DialogTitle className="flex flex-row items-center gap-2">
      <ScheduleIcon color="warning" />
      Mantenciones pendientes de cargar
    </DialogTitle>
    <DialogContent dividers>
      <p>
        Ya son más de las {HORA_ALERTA_MANTENCIONES}:00 y faltan{" "}
        <strong>{faltantes}</strong>{" "}
        {faltantes === 1 ? "mantención" : "mantenciones"} por cargar del día{" "}
        <strong>{dia}</strong>.
      </p>
    </DialogContent>
    <DialogActions className="flex flex-row flex-wrap gap-2">
      <Button onClick={onAceptar} color="inherit">
        Aceptar
      </Button>
      <Button onClick={onIrARegistrar} color="primary" variant="contained">
        Ir a registrar
      </Button>
    </DialogActions>
  </Dialog>
);

export default PendingMaintenancesModal;
