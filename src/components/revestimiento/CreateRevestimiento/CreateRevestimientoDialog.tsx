import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import style from "./CreateRevestimientoDialog.module.css";

import { useEffect, useState } from "react";

import { green } from "@mui/material/colors";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import type {
  IRevestimiento,
  IRevestimientoCreate,
} from "../../../service/revestimientoInterface";
import RevestimientoFields from "./RevestimientoFields";
import { useClientStore } from "../../../store/ClientStore";
import { revestimientoService } from "../../../core/services/RevestimientoService";

interface CreateRevestimientoDialogProps {
  open: boolean;
  onClose: () => void;
  revestimientoInfo?: IRevestimiento;
  isEditMode?: boolean;
}

const CreateRevestimientoDialog = ({
  open = false,
  onClose,
}: // revestimientoInfo,
// isEditMode,
CreateRevestimientoDialogProps) => {
  const { clients, fetchClients } = useClientStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [revestimientoData, setRevestimientoData] = useState<
    Partial<IRevestimientoCreate>
  >({});

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      // 1) crear revestimiento
      const created = await revestimientoService.createNewRevestimiento(
        revestimientoData
      );
      // 2) si hay urls en state, asociarlas en bulk
      if (revestimientoData.urls?.length) {
        await revestimientoService.addImagesBulk(
          created.id,
          revestimientoData.urls
        );
      }
      // hecho
      setSuccess(true);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle className={style.dialogTitle}>
        Crear Nuevo Revestimiento
      </DialogTitle>
      <DialogContent>
        <div className={style.formContainer}>
          <RevestimientoFields
            clients={clients}
            value={revestimientoData}
            onChange={(next) => setRevestimientoData(next)}
          />
        </div>
      </DialogContent>
      <DialogActions className={style.dialogActions}>
        <Fab
          aria-label="save"
          color="primary"
          sx={buttonSx}
          onClick={handleButtonClick}
          disabled={loading}
        >
          {success ? <CheckIcon /> : <SaveIcon />}
        </Fab>
        <button onClick={onClose}>Cancelar</button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRevestimientoDialog;
