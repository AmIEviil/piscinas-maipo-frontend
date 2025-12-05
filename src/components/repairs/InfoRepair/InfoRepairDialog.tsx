import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle } from "@mui/material";
import style from "./InfoRepair.module.css";
import type { IRepair } from "../../../service/repairs.interface";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import ConstructionIcon from "@mui/icons-material/Construction";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";

interface InfoRepairDialogProps {
  open: boolean;
  repairInfo?: IRepair;
  onClose: () => void;
}

const InfoRepairDialog = ({
  open = false,
  repairInfo,
  onClose,
}: InfoRepairDialogProps) => {
  const handleClose = () => {
    onClose();
  };
  if (!repairInfo) return null;
  return (
    <Dialog
      fullWidth={true}
      maxWidth={"lg"} // Un poco más ancho para ver bien las tablas/grids
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 24, padding: "1rem" },
      }}
    >
      <DialogTitle className={style.dialogTitle}>
        Detalle del la Reparación
        <div className="text-sm font-normal text-gray-500 mt-1">
          ID: {repairInfo.id} | Estado:{" "}
          <span className="font-bold text-blue-600">{repairInfo.estado}</span>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className={style.contentContainer}>
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <PersonIcon /> Información del Cliente
            </h4>
            <div className={style.gridContainer}>
              <div className={style.infoItem}>
                <span className={style.label}>Nombre</span>
                <span className={style.value}>{repairInfo.client.nombre}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Teléfono</span>
                <span className={style.value}>
                  {repairInfo.client.telefono}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Email</span>
                <span className={style.value}>
                  {repairInfo.client.email || "-"}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Dirección</span>
                <span className={style.value}>
                  {repairInfo.client.direccion}, {repairInfo.client.comuna}
                </span>
              </div>
            </div>
          </div>
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <ConstructionIcon /> Información de la Reparación
            </h4>
            <div className={style.gridContainer}>
              <div className={style.infoItem}>
                <span className={style.label}>Fecha Ingreso</span>
                <span className={style.value}>{repairInfo.fecha_ingreso}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Fecha de Trabajo</span>
                <span className={style.value}>{repairInfo.fecha_trabajo}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Detalles</span>
                <span className={style.value}>{repairInfo.detalles}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Materiales</span>
                <span className={style.value}>{repairInfo.materiales}</span>
              </div>
            </div>
          </div>
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <AttachMoneyIcon /> Valores de la Reparación
            </h4>
            <div className={style.gridContainer}>
              <div className={style.infoItem}>
                <span className={style.label}>Costos</span>
                <span className={style.value}>
                  {formatMoneyNumber(repairInfo.costo_reparacion)}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Valor Total Cliente</span>
                <span className={style.value}>
                  {formatMoneyNumber(repairInfo.valor_reparacion)}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Garantía</span>
                <span className={style.value}>{repairInfo.garantia}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoRepairDialog;
