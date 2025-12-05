import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import style from "./CreateRepairsDialog.module.css";

// Interfaces y Stores
import { useClientStore } from "../../../store/ClientStore";

// Componentes UI
import Button from "../../ui/button/Button";

// Iconos
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";

import type { IRepair, IRepairCreate } from "../../../service/repairs.interface";
import { useCreateRepair, useUpdateRepair } from "../../../hooks/RepairsHooks";
import RepairFields from "./RepairFields";

interface CreateRepairsDialogProps {
  open: boolean;
  onClose: () => void;
  repairInfo?: IRepair;
  isEditMode?: boolean;
}

const CreateRepairsDialog = ({
  open = false,
  onClose,
  repairInfo,
  isEditMode,
}: CreateRepairsDialogProps) => {
  const { clients, fetchClients } = useClientStore();
  const useCreateRepairMutation = useCreateRepair();
  const useUpdateRepairMutation = useUpdateRepair();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [repairData, setRepairData] = useState<Partial<IRepairCreate>>({});

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  useEffect(() => {
    if (repairInfo) {
      setRepairData(repairInfo);
    } else {
      setRepairData({}); // Reset si es nuevo
    }
  }, [repairInfo, open]);

  const clearForm = () => {
    setRepairData({});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log("Repair Data to submit:", repairData);
      if (isEditMode) {
        if (!repairInfo?.id) return;
        await useUpdateRepairMutation.mutateAsync({
          repairId: repairInfo?.id.toString(),
          data: repairData,
        });
      } else {
        const created = await useCreateRepairMutation.mutateAsync(repairData);
        if (created) {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle className={style.dialogTitle}>
        {repairInfo ? "Editar Reparación" : "Crear Nueva Reparación"}
      </DialogTitle>

      <DialogContent className="custom-scrollbar">
        <div className={style.formContainer}>
          <RepairFields
            value={repairData}
            onChange={(next) => setRepairData(next)}
            clients={clients}
          />
        </div>
      </DialogContent>

      <DialogActions className={style.dialogActions}>
        <Button
          className="bg-gray-400 hover:bg-gray-500 text-white"
          onClick={onClose}
          disabled={loading || success}
          label="Cancelar"
        />
        <Button
          onClick={handleSubmit}
          label={success ? "Guardado!" : "Guardar Reparación"}
          disabled={loading || success}
          icon={success ? <CheckIcon /> : <SaveIcon />}
        />
      </DialogActions>
    </Dialog>
  );
};

export default CreateRepairsDialog;
