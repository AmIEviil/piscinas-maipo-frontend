import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { type Client } from "../../../service/client.interface";
import CustomInputText from "../../ui/InputText/CustomInputText";
import style from "./CreateClientDialog.module.css";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import PaidIcon from "@mui/icons-material/Paid";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import PoolIcon from "@mui/icons-material/Pool";

import { useCreateClient, useUpdateClient } from "../../../hooks/ClientHooks";
import { useEffect, useState } from "react";

import CustomSelect from "../../ui/Select/Select";
import {
  comunas,
  dias,
  rutas,
  tiposPiscinasMaterial,
} from "../../../constant/constantBodyClient";
import SaveIcon from "@mui/icons-material/Save";
import Calendar from "../../ui/datepicker/DatePicker";
import Button from "../../ui/button/Button";
import LabelField from "../../ui/labelField/LabelField";
import CustomCheckbox from "../../ui/checkbox/CustomCheckBox";
import { CustomTextArea } from "../../ui/InputText/CustonTextArea";

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  clientInfo?: Client;
  isEditMode?: boolean;
}

const CreateClientDialog = ({
  open = false,
  onClose,
  clientInfo,
  isEditMode,
}: CreateClientDialogProps) => {
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  // Estados del formulario
  const [nameClient, setNameClient] = useState<string>("");
  const [direccionClient, setdireccionClient] = useState<string>("");
  const [telefonoClient, setTelefonoClient] = useState<string>("");
  const [tipoPiscinaClient, settipoPiscinaClient] = useState<string>("");
  const [fechaIngresoClient, setFechaIngresoClient] = useState<Date | null>(
    null
  );
  const [comunaClient, setcomunaClient] = useState<string>("");
  const [emailClient, setEmailClient] = useState<string>("");
  const [valorMantencionClient, setValorMantencionClient] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [diaMantencionClient, setDiaMantencionClient] = useState<string>("");

  // Nuevos campos
  const [rutaClient, setRutaClient] = useState<string>("");
  const [observacionesClient, setObservacionesClient] = useState<string>("");
  const [isActiveClient, setIsActiveClient] = useState<boolean>(true);

  // Estados de carga/éxito
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Efecto para cargar datos en modo edición
  useEffect(() => {
    if (isEditMode && clientInfo) {
      setNameClient(clientInfo.nombre);
      setdireccionClient(clientInfo.direccion);
      setTelefonoClient(clientInfo.telefono);
      settipoPiscinaClient(clientInfo.tipo_piscina);
      setFechaIngresoClient(
        clientInfo.fecha_ingreso ? new Date(clientInfo.fecha_ingreso) : null
      );
      setcomunaClient(clientInfo.comuna);
      setEmailClient(clientInfo.email || "");
      setValorMantencionClient(clientInfo.valor_mantencion);
      setDiaMantencionClient(clientInfo.dia_mantencion);

      // Cargar nuevos campos si existen en clientInfo
      setRutaClient(clientInfo.ruta || "");
      setObservacionesClient(clientInfo.observaciones || ""); // Asumiendo que Client tiene observaciones
      setIsActiveClient(
        clientInfo.isActive !== undefined ? clientInfo.isActive : true
      );

      setInputValue(
        Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(clientInfo.valor_mantencion)
      );
    } else {
      clearForm(); // Limpiar si se abre para crear
    }
  }, [clientInfo, isEditMode, open]);

  const clearForm = () => {
    setNameClient("");
    setdireccionClient("");
    setTelefonoClient("");
    settipoPiscinaClient("");
    setFechaIngresoClient(null);
    setcomunaClient("");
    setEmailClient("");
    setValorMantencionClient(0);
    setDiaMantencionClient("");
    setInputValue("");
    setRutaClient("");
    setObservacionesClient("");
    setIsActiveClient(true);
    setSuccess(false);
  };

  const handlePriceChange = (value: string) => {
    const numeric = value.replace(/[^\d]/g, "");
    setInputValue(numeric);
    setValorMantencionClient(Number(numeric));
  };

  const handlePriceBlur = () => {
    if (valorMantencionClient !== undefined && !isNaN(valorMantencionClient)) {
      setInputValue(
        Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(valorMantencionClient)
      );
    }
  };

  const handleButtonClick = async () => {
    if (loading) return;

    setLoading(true);

    const clientToSubmit: Client = {
      nombre: nameClient,
      direccion: direccionClient,
      telefono: telefonoClient,
      tipo_piscina: tipoPiscinaClient,
      dia_mantencion: diaMantencionClient,
      fecha_ingreso: fechaIngresoClient || new Date(),
      comuna: comunaClient,
      email: emailClient,
      valor_mantencion: valorMantencionClient,
      ruta: rutaClient,
      observaciones: observacionesClient,
      isActive: isActiveClient,
    };

    try {
      if (isEditMode && clientInfo?.id) {
        await updateClientMutation.mutateAsync({
          clientId: clientInfo.id,
          data: clientToSubmit,
        });
      } else {
        await createClientMutation.mutateAsync(clientToSubmit);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error guardando cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValidForm =
    nameClient &&
    direccionClient &&
    telefonoClient &&
    tipoPiscinaClient &&
    diaMantencionClient &&
    comunaClient &&
    valorMantencionClient > 0;

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle className={style.dialogTitle}>
        {isEditMode ? "Editar Cliente" : "Crear Nuevo Cliente"}
      </DialogTitle>

      <DialogContent className="custom-scrollbar">
        <div className={style.container}>
          {/* Sección 1: Información Personal */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <PersonIcon fontSize="small" /> Información Personal
            </h4>
            <div className={style.gridContainer}>
              <CustomInputText
                title="Nombre Cliente"
                require
                onChange={setNameClient}
                value={nameClient}
              />
              <CustomInputText
                title="Teléfono"
                require
                onChange={setTelefonoClient}
                value={telefonoClient}
              />
              <CustomInputText
                title="Email"
                require={false}
                onChange={setEmailClient}
                value={emailClient}
              />
            </div>
          </div>

          {/* Sección 2: Ubicación */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <HomeIcon fontSize="small" /> Ubicación
            </h4>
            <div className={style.gridContainer}>
              <CustomInputText
                title="Dirección"
                require
                onChange={setdireccionClient}
                value={direccionClient}
              />
              <div className="flex flex-col gap-1">
                <LabelField label="Comuna" required />
                <CustomSelect
                  label=""
                  options={comunas}
                  onChange={(e) => setcomunaClient(String(e.target.value))}
                  value={comunaClient}
                />
              </div>
              <div className="flex flex-col gap-1">
                <LabelField label="Ruta" required />
                <CustomSelect
                  label=""
                  options={rutas} // Asegúrate de tener rutas importado de tus constantes
                  onChange={(e) => setRutaClient(String(e.target.value))}
                  value={rutaClient}
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Detalles del Servicio */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <PoolIcon fontSize="small" /> Detalles del Servicio
            </h4>
            <div className={style.gridContainer}>
              <div className="flex flex-col gap-1">
                <LabelField label="Tipo de Piscina" required />
                <CustomSelect
                  label=""
                  options={tiposPiscinasMaterial}
                  onChange={(e) => settipoPiscinaClient(String(e.target.value))}
                  value={tipoPiscinaClient}
                />
              </div>
              <div className="flex flex-col gap-1">
                <LabelField label="Día Mantención" required>
                  <CustomSelect
                    label=""
                    options={dias}
                    onChange={(e) =>
                      setDiaMantencionClient(String(e.target.value))
                    }
                    value={diaMantencionClient}
                  />
                </LabelField>
              </div>
              <div className="flex flex-col gap-1">
                <Calendar
                  title="Fecha de Ingreso"
                  mode="day"
                  required
                  initialValue={
                    fechaIngresoClient
                      ? new Date(fechaIngresoClient)
                      : undefined
                  }
                  onChange={({ start }) =>
                    setFechaIngresoClient(
                      start ? new Date(start) : fechaIngresoClient ?? new Date()
                    )
                  }
                />
              </div>
              <CustomInputText
                title="Valor Mantención"
                icon={<PaidIcon />}
                require
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                value={inputValue}
              />
            </div>
          </div>

          {/* Sección 4: Configuración Adicional */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <SettingsIcon fontSize="small" /> Configuración Adicional
            </h4>
            <div className={style.gridContainer}>
              <div className={style.fullWidth}>
                <CustomTextArea
                  title="Observaciones"
                  placeholder="Detalles adicionales sobre el cliente o la piscina..."
                  value={observacionesClient}
                  onChange={setObservacionesClient}
                />
              </div>

              {isEditMode && (
                <div className="flex items-center gap-2 mt-2">
                  <LabelField label="Cliente Activo" />
                  <CustomCheckbox
                    checked={isActiveClient}
                    onChange={setIsActiveClient}
                  />
                </div>
              )}
            </div>
          </div>
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
          onClick={handleButtonClick}
          label={
            success
              ? "Guardado!"
              : isEditMode
              ? "Guardar Cambios"
              : "Crear Cliente"
          }
          disabled={!isValidForm || loading || success}
          icon={success ? <CheckIcon /> : <SaveIcon />}
        />
      </DialogActions>
    </Dialog>
  );
};

export default CreateClientDialog;
