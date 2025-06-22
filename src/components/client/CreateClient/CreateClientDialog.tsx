import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { type Client } from "../../../service/clientInterface";
import CustomInputText from "../../ui/InputText/CustomInputText";
import style from "./CreateClientDialog.module.css";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PoolIcon from "@mui/icons-material/Pool";
import PaidIcon from "@mui/icons-material/Paid";

import { useCreateClient, useUpdateClient } from "../../../hooks/ClientHooks";
import { useEffect, useRef, useState } from "react";

import DatePicker from "../../ui/calendar/DatePicker";
import dayjs from "dayjs";
import CustomSelect from "../../ui/Select/Select";
import {
  comunas,
  dias,
  tiposPiscinasMaterial,
} from "../../../constant/constantBodyClient";
import { green } from "@mui/material/colors";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import type { SelectChangeEvent } from "@mui/material";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";

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

  const [nameClient, setNameClient] = useState<string>();
  const [direccionClient, setdireccionClient] = useState<string>();
  const [telefonoClient, setTelefonoClient] = useState<string>();
  const [tipoPiscinaClient, settipoPiscinaClient] = useState<string>();
  const [fechaIngresoClient, setFechaIngreso] = useState<Date>();
  const [comunaClient, setcomunaClient] = useState<string>();
  const [emailClient, setEmailClient] = useState<string>();
  const [valorMantencionClient, setValorMantencionClient] = useState<number>();
  const [diaMantencionClient, setDiaMantencionClient] = useState<string>();

  const handleName = (value: string) => {
    setNameClient(value);
  };
  const handleDireccion = (value: string) => {
    setdireccionClient(value);
  };
  const handleTelefono = (value: string) => {
    setTelefonoClient(value);
  };
  const handleTipoPiscina = (event: SelectChangeEvent) => {
    settipoPiscinaClient(event.target.value);
  };
  const handleFechaIngreso = (value: Date) => {
    setFechaIngreso(value);
  };
  const handleComuna = (event: SelectChangeEvent) => {
    setcomunaClient(event.target.value);
  };
  const handleEmail = (value: string) => {
    setEmailClient(value);
  };
  const handleValorMantencion = (value: number | string) => {
    setValorMantencionClient(Number(value));
  };
  const handleDiaMantencion = (event: SelectChangeEvent) => {
    setDiaMantencionClient(event.target.value);
  };

  const handleButtonClick = async () => {
    if (loading) return;

    setSuccess(false);
    setLoading(true);
    const clientToSubmit: Client = {
      nombre: nameClient ?? "",
      direccion: direccionClient ?? "",
      telefono: telefonoClient ?? "",
      tipo_piscina: tipoPiscinaClient ?? "",
      dia_mantencion: diaMantencionClient ?? "",
      fecha_ingreso: fechaIngresoClient ?? new Date(),
      comuna: comunaClient ?? "",
      email: emailClient ?? "",
      valor_mantencion: valorMantencionClient || 0,
    };

    try {
      if (isEditMode) {
        if (!clientInfo?.id) return;
        await updateClientMutation.mutateAsync({
          clientId: clientInfo.id,
          data: clientToSubmit,
        });
      } else {
        await createClientMutation.mutateAsync(clientToSubmit);
      }
      setSuccess(true);
      setLoading(false);
      // Opcional: cerrar el modal si todo salió bien
      onClose();
    } catch (error) {
      console.error("Error creando cliente:", error);
      setSuccess(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isValidForm =
    nameClient?.length &&
    direccionClient?.length &&
    telefonoClient?.length &&
    tipoPiscinaClient?.length &&
    diaMantencionClient?.length &&
    comunaClient?.length &&
    valorMantencionClient
      ? true
      : false;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (isEditMode && clientInfo) {
      setNameClient(clientInfo.nombre);
      setdireccionClient(clientInfo.direccion);
      setTelefonoClient(clientInfo.telefono);
      settipoPiscinaClient(clientInfo.tipo_piscina);
      setFechaIngreso(clientInfo.fecha_ingreso);
      setcomunaClient(clientInfo.comuna);
      setEmailClient(clientInfo.email);
      setValorMantencionClient(clientInfo.valor_mantencion);
      setDiaMantencionClient(clientInfo.dia_mantencion);
    }
  }, [clientInfo, isEditMode]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle className={style.dialogTitle}>
        Crear Nuevo Cliente
      </DialogTitle>
      <DialogContent>
        <div className={style.formContainer}>
          <div className={style.fieldsContainer}>
            <div className={style.inputField}>
              <CustomInputText
                title="Nombre"
                icon={<PersonIcon />}
                require
                onChange={handleName}
                initialValue={nameClient}
              />
            </div>
            <div className={style.inputField}>
              <CustomInputText
                title="Teléfono"
                icon={<PhoneIcon />}
                onChange={handleTelefono}
                initialValue={telefonoClient}
              />
            </div>
          </div>
          <div className={style.fieldsContainer}>
            <div className={style.inputField}>
              <CustomInputText
                title="Email"
                icon={<EmailIcon />}
                require={false}
                onChange={handleEmail}
                initialValue={emailClient}
              />
            </div>
            <div className={style.inputField}>
              <CustomInputText
                title="Dirección"
                icon={<HomeIcon />}
                onChange={handleDireccion}
                initialValue={direccionClient}
              />
            </div>
            <div className={style.inputField}>
              <span className={style.labelField}>
                <CalendarMonthIcon />
                Fecha de Ingreso
              </span>
              <DatePicker
                value={
                  fechaIngresoClient ? dayjs(fechaIngresoClient) : undefined
                }
                onChange={handleFechaIngreso}
              />
            </div>
            <div className={style.inputField}>
              <span className={style.labelField}>
                <LocationCityIcon />
                Comuna
              </span>
              <CustomSelect
                label=""
                options={comunas}
                onChange={handleComuna}
                value={comunaClient}
              />
            </div>
            <div className={style.inputField}>
              <span className={style.labelField}>
                <CalendarMonthIcon />
                Dia Mantención
              </span>
              <CustomSelect
                label=""
                options={dias}
                onChange={handleDiaMantencion}
                value={diaMantencionClient}
              />
            </div>
            <div className={style.inputField}>
              <span className={style.labelField}>
                <PoolIcon />
                Tipo de Piscina
              </span>
              <CustomSelect
                label=""
                options={tiposPiscinasMaterial}
                onChange={handleTipoPiscina}
                value={tipoPiscinaClient}
              />
            </div>
            <div className={style.inputField}>
              <CustomInputText
                icon={<PaidIcon />}
                onChange={handleValorMantencion}
                initialValue={formatMoneyNumber(valorMantencionClient)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className={style.dialogActions}>
        <Fab
          aria-label="save"
          color="primary"
          sx={buttonSx}
          onClick={handleButtonClick}
          disabled={!isValidForm || loading}
        >
          {success ? <CheckIcon /> : <SaveIcon />}
        </Fab>
        <button onClick={onClose}>Cancelar</button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateClientDialog;
