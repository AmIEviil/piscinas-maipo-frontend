import { useEffect, useState } from "react";

// Interfaces y Stores
import { useClientStore } from "../../../store/ClientStore";

// Componentes UI
import Button from "../../ui/button/Button";

// Iconos
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";

import type {
  IRepair,
  IRepairCreate,
} from "../../../service/repairs.interface";
import { useCreateRepair, useUpdateRepair } from "../../../hooks/RepairsHooks";
import RepairFields from "./RepairFields";
import { validarReparacion } from "./repairValidation";
import FormSheet from "../../ui/formSheet/FormSheet";

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
  // Los errores se muestran recien despues del primer intento de guardar,
  // para no recibir al usuario con el formulario en rojo.
  const [intentado, setIntentado] = useState(false);
  const errores = intentado ? validarReparacion(repairData) : {};

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
    setIntentado(false);
    setSuccess(false);
  }, [repairInfo, open]);

  const clearForm = () => {
    setRepairData({});
  };

  const handleSubmit = async () => {
    if (Object.keys(validarReparacion(repairData)).length > 0) {
      setIntentado(true);
      // Lleva al primer campo con error: el cuerpo de la hoja hace scroll.
      requestAnimationFrame(() =>
        document
          .querySelector("[role=alert]")
          ?.parentElement?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
      );
      return;
    }

    setLoading(true);
    try {
      // garantia es string obligatorio en el DTO del backend, aunque en el
      // formulario sea opcional.
      const payload = { ...repairData, garantia: repairData.garantia ?? "" };
      if (isEditMode) {
        if (!repairInfo?.id) return;
        await useUpdateRepairMutation.mutateAsync({
          repairId: repairInfo.id.toString(),
          data: payload,
        });
      } else {
        await useCreateRepairMutation.mutateAsync(payload);
      }
      // Antes la edicion no marcaba exito ni cerraba la hoja.
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  return (
    <FormSheet
      open={open}
      onClose={handleClose}
      title={repairInfo ? "Editar reparación" : "Nueva reparación"}
      subtitle={
        repairInfo
          ? repairInfo.client?.nombre
          : "Los campos con * son obligatorios"
      }
      size="lg"
      footer={
        <>
          <Button
            label="Cancelar"
            variant="tertiary"
            onClick={onClose}
            disabled={loading || success}
          />
          <Button
            onClick={handleSubmit}
            label={success ? "¡Guardado!" : "Guardar"}
            variant="primary"
            disabled={loading || success}
            icon={success ? <CheckIcon /> : <SaveIcon />}
          />
        </>
      }
    >
      <RepairFields
        value={repairData}
        onChange={(next) => setRepairData(next)}
        clients={clients}
        errores={errores}
      />
    </FormSheet>
  );
};

export default CreateRepairsDialog;
