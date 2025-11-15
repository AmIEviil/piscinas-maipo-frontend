import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import style from "./CreateRevestimientoDialog.module.css";

import { useEffect, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import type {
  IRevestimiento,
  IRevestimientoCreate,
} from "../../../service/revestimientoInterface";
import RevestimientoFields from "./RevestimientoFields";
import { useClientStore } from "../../../store/ClientStore";
import { revestimientoService } from "../../../core/services/RevestimientoService";
import Button from "../../ui/button/Button";

interface CreateRevestimientoDialogProps {
  open: boolean;
  onClose: () => void;
  revestimientoInfo?: IRevestimiento;
  isEditMode?: boolean;
}

const CreateRevestimientoDialog = ({
  open = false,
  onClose,
  revestimientoInfo,
}: // isEditMode,
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

  useEffect(() => {
    if (revestimientoInfo) {
      setRevestimientoData(revestimientoInfo);
    }
  }, [revestimientoInfo]);

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      // 1) crear revestimiento
      const created = await revestimientoService.createNewRevestimiento(
        revestimientoData
      );
      // 2) si hay imagenes en state, asociarlas en bulk
      if (revestimientoData.imagenes?.length) {
        await revestimientoService.addImagesBulk(
          created.id,
          revestimientoData.imagenes?.map((img) => img.url) || []
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
        <button onClick={onClose} disabled={loading || success}>
          Cancelar
        </button>
        <Button
          onClick={handleButtonClick}
          label="Guardar"
          disabled={loading || success}
          icon={success ? <CheckIcon /> : <SaveIcon />}
        />
      </DialogActions>
    </Dialog>
  );
};

export default CreateRevestimientoDialog;
