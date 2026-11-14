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
import FormSheet from "../../ui/formSheet/FormSheet";

interface CreateRevestimientoDialogProps {
  open: boolean;
  onClose: () => void;
  revestimientoInfo?: IRevestimiento;
  isEditMode?: boolean;
  /** Se llama tras guardar con exito, para refrescar el listado. */
  onSaved?: () => void;
}

const CreateRevestimientoDialog = ({
  open = false,
  onClose,
  revestimientoInfo,
  isEditMode = false,
  onSaved,
}: CreateRevestimientoDialogProps) => {
  const editando = isEditMode && !!revestimientoInfo;
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

  // Al abrir: en edicion parte de los datos guardados; al crear, de cero.
  // Antes solo se cargaba cuando habia revestimientoInfo y nunca se limpiaba,
  // asi que "Nuevo" despues de editar abria el formulario prellenado.
  useEffect(() => {
    if (!open) return;
    setSuccess(false);
    if (editando && revestimientoInfo) {
      setRevestimientoData({
        ...revestimientoInfo,
        clienteId: revestimientoInfo.client?.id,
        imagenes: revestimientoInfo.imagenes ?? [],
        extras: revestimientoInfo.extras ?? [],
      });
    } else {
      setRevestimientoData({});
    }
  }, [open, editando, revestimientoInfo]);

  const crear = async () => {
    const created = await revestimientoService.createNewRevestimiento(
      revestimientoData
    );
    if (revestimientoData.imagenes?.length) {
      await revestimientoService.addImagesBulk(
        created.id,
        revestimientoData.imagenes || []
      );
    }
  };

  // Antes la edicion llamaba a createNewRevestimiento y duplicaba el registro.
  const actualizar = async (original: IRevestimiento) => {
    const {
      imagenes = [],
      extras,
      ...campos
    } = revestimientoData as Partial<IRevestimientoCreate> &
      Partial<Pick<IRevestimiento, "id">>;
    delete campos.id;
    delete campos.client;

    await revestimientoService.updateRevestimiento(original.id, {
      ...campos,
      // El backend reemplaza la lista completa de extras.
      extras: extras?.map(({ nombre, valor, detalle }) => ({
        nombre,
        valor,
        detalle,
      })),
    });

    // Imagenes: las nuevas (sin id) se agregan; las guardadas que se
    // quitaron del formulario se borran.
    const nuevas = imagenes.filter((img) => !img.id);
    if (nuevas.length) {
      await revestimientoService.addImagesBulk(original.id, nuevas);
    }
    const conservadas = new Set(imagenes.map((img) => img.id).filter(Boolean));
    const quitadas = (original.imagenes ?? []).filter(
      (img) => img.id && !conservadas.has(img.id)
    );
    await Promise.all(
      quitadas.map((img) => revestimientoService.deleteImagen(img.id!))
    );
  };

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      if (editando && revestimientoInfo) {
        await actualizar(revestimientoInfo);
      } else {
        await crear();
      }
      setSuccess(true);
      onSaved?.();
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
    <FormSheet
      open={open}
      onClose={handleClose}
      title={editando ? "Editar revestimiento" : "Nuevo revestimiento"}
      subtitle={
        editando
          ? revestimientoInfo?.client?.nombre
          : "Los campos con * son obligatorios"
      }
      size="xl"
      footer={
        <>
          <Button
            label="Cancelar"
            variant="tertiary"
            onClick={onClose}
            disabled={loading || success}
          />
          <Button
            onClick={handleButtonClick}
            label={success ? "¡Guardado!" : "Guardar"}
            variant="primary"
            disabled={loading || success}
            icon={success ? <CheckIcon /> : <SaveIcon />}
          />
        </>
      }
    >
      <RevestimientoFields
        clients={clients}
        value={revestimientoData}
        onChange={(next) => setRevestimientoData(next)}
      />
    </FormSheet>
  );
};

export default CreateRevestimientoDialog;
