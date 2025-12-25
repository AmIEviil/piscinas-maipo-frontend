import style from "./CreateRevestimientoDialog.module.css";

import { useEffect, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import type {
  IRevestimiento,
  IRevestimientoCreate,
} from "../../../service/revestimiento.interface";
import RevestimientoFields from "./RevestimientoFields";
import { useClientStore } from "../../../store/ClientStore";
import { revestimientoService } from "../../../core/services/RevestimientoService";
import Button from "../../ui/button/Button";
import { Modal } from "react-bootstrap";

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
}: CreateRevestimientoDialogProps) => {
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
      const created = await revestimientoService.createNewRevestimiento(
        revestimientoData
      );
      if (revestimientoData.imagenes?.length) {
        await revestimientoService.addImagesBulk(
          created.id,
          revestimientoData.imagenes || []
        );
      }
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
    <Modal show={open} onHide={handleClose} size="xl" centered>
      <Modal.Header className={style.dialogTitle} closeButton>
        Crear Nuevo Revestimiento
      </Modal.Header>
      <Modal.Body className="max-h-[70vh] overflow-auto custom-scrollbar">
        <div className={style.formContainer}>
          <RevestimientoFields
            clients={clients}
            value={revestimientoData}
            onChange={(next) => setRevestimientoData(next)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className={style.dialogActions}>
        <button onClick={onClose} disabled={loading || success}>
          Cancelar
        </button>
        <Button
          onClick={handleButtonClick}
          label="Guardar"
          disabled={loading || success}
          icon={success ? <CheckIcon /> : <SaveIcon />}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default CreateRevestimientoDialog;
