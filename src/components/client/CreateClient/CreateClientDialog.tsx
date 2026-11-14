import { type Client } from "../../../service/client.interface";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import PoolIcon from "@mui/icons-material/Pool";
import SaveIcon from "@mui/icons-material/Save";

import {
  useCreateClient,
  useFrecuenciasMantencion,
  useUpdateClient,
} from "../../../hooks/ClientHooks";
import { useEffect, useState } from "react";

import {
  comunas,
  dias,
  rutas,
  tiposPiscinasMaterial,
} from "../../../constant/constantBodyClient";
import Button from "../../ui/button/Button";
import FormSheet from "../../ui/formSheet/FormSheet";
import {
  FormDate,
  FormField,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
  FormToggle,
} from "../../ui/formSheet/FormFields";

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
  const { data: frecuencias = [] } = useFrecuenciasMantencion();

  const opcionesFrecuencia = frecuencias.map((frecuencia) => ({
    value: frecuencia.id,
    label: frecuencia.nombre,
  }));

  // Estados del formulario
  const [nameClient, setNameClient] = useState<string>("");
  const [direccionClient, setdireccionClient] = useState<string>("");
  const [telefonoClient, setTelefonoClient] = useState<string>("");
  const [tipoPiscinaClient, settipoPiscinaClient] = useState<string>("");
  const [fechaIngresoClient, setFechaIngresoClient] = useState<Date | null>(
    null,
  );
  const [comunaClient, setcomunaClient] = useState<string>("");
  const [emailClient, setEmailClient] = useState<string>("");
  const [valorMantencionClient, setValorMantencionClient] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [diaMantencionClient, setDiaMantencionClient] = useState<string>("");
  const [frecuenciaClient, setFrecuenciaClient] = useState<string>("");

  // Nuevos campos
  const [rutaClient, setRutaClient] = useState<string>("");
  const [observacionClient, setObservacionClient] = useState<string>("");
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
        clientInfo.fecha_ingreso ? new Date(clientInfo.fecha_ingreso) : null,
      );
      setcomunaClient(clientInfo.comuna);
      setEmailClient(clientInfo.email || "");
      setValorMantencionClient(clientInfo.valor_mantencion);
      setDiaMantencionClient(clientInfo.dia_mantencion);
      // El listado entrega la relacion completa; el formulario trabaja con el
      // id, que es lo unico que el API acepta al guardar.
      setFrecuenciaClient(
        clientInfo.frecuencia_mantencion?.id ??
          clientInfo.frecuencia_mantencion_id ??
          "",
      );

      // Cargar nuevos campos si existen en clientInfo
      setRutaClient(clientInfo.ruta || "");
      setObservacionClient(clientInfo.observacion || ""); // Asumiendo que Client tiene observacion
      setIsActiveClient(
        clientInfo.isActive !== undefined ? clientInfo.isActive : true,
      );

      setInputValue(
        Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(clientInfo.valor_mantencion),
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
    setFrecuenciaClient("");
    setInputValue("");
    setRutaClient("");
    setObservacionClient("");
    setIsActiveClient(true);
    setSuccess(false);
  };

  // Cliente nuevo parte en Semanal: es lo que tiene hoy la totalidad de la
  // cartera, y obliga a elegir explicitamente solo a quien sea la excepcion.
  useEffect(() => {
    if (isEditMode || frecuenciaClient || frecuencias.length === 0) return;
    const semanal = frecuencias.find((f) => f.nombre === "Semanal");
    if (semanal) setFrecuenciaClient(semanal.id);
  }, [isEditMode, frecuenciaClient, frecuencias, open]);

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
        }).format(valorMantencionClient),
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
      // undefined y no "": el campo valida como uuid en el backend, y una
      // cadena vacia devuelve 400 en vez de dejarlo sin definir.
      frecuencia_mantencion_id: frecuenciaClient || undefined,
      fecha_ingreso: fechaIngresoClient || new Date(),
      comuna: comunaClient,
      email: emailClient,
      valor_mantencion: valorMantencionClient,
      ruta: rutaClient,
      observacion: observacionClient,
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
    frecuenciaClient &&
    comunaClient &&
    valorMantencionClient > 0;

  const opcionesSinVacio = (opciones: { value: string; label: string }[]) =>
    opciones.filter((opcion) => opcion.value !== "");

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      title={isEditMode ? "Editar cliente" : "Nuevo cliente"}
      subtitle={
        isEditMode ? clientInfo?.nombre : "Los campos con * son obligatorios"
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
            onClick={handleButtonClick}
            label={
              success
                ? "¡Guardado!"
                : isEditMode
                  ? "Guardar cambios"
                  : "Crear cliente"
            }
            variant="primary"
            disabled={!isValidForm || loading || success}
            icon={success ? <CheckIcon /> : <SaveIcon />}
          />
        </>
      }
    >
      <FormSection
        title="Datos personales"
        icon={<PersonIcon fontSize="inherit" />}
      >
        <FormField label="Nombre" htmlFor="cliente-nombre" required full>
          <FormInput
            id="cliente-nombre"
            autoComplete="name"
            autoCapitalize="words"
            value={nameClient}
            onChange={(e) => setNameClient(e.target.value)}
          />
        </FormField>
        <FormField label="Teléfono" htmlFor="cliente-telefono" required>
          <FormInput
            id="cliente-telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+56 9 1234 5678"
            value={telefonoClient}
            onChange={(e) => setTelefonoClient(e.target.value)}
          />
        </FormField>
        <FormField label="Email" htmlFor="cliente-email" hint="(opcional)">
          <FormInput
            id="cliente-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            value={emailClient}
            onChange={(e) => setEmailClient(e.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Ubicación" icon={<HomeIcon fontSize="inherit" />}>
        <FormField label="Dirección" htmlFor="cliente-direccion" required full>
          <FormInput
            id="cliente-direccion"
            autoComplete="street-address"
            value={direccionClient}
            onChange={(e) => setdireccionClient(e.target.value)}
          />
        </FormField>
        <FormField label="Comuna" htmlFor="cliente-comuna" required>
          <FormSelect
            id="cliente-comuna"
            placeholder="Elegir comuna..."
            options={opcionesSinVacio(comunas)}
            value={comunaClient}
            onChange={(e) => setcomunaClient(e.target.value)}
          />
        </FormField>
        <FormField label="Ruta" htmlFor="cliente-ruta">
          <FormSelect
            id="cliente-ruta"
            placeholder="Sin ruta"
            options={opcionesSinVacio(rutas)}
            value={rutaClient}
            onChange={(e) => setRutaClient(e.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Servicio" icon={<PoolIcon fontSize="inherit" />}>
        <FormField label="Tipo de piscina" htmlFor="cliente-tipo" required>
          <FormSelect
            id="cliente-tipo"
            placeholder="Elegir tipo..."
            options={tiposPiscinasMaterial}
            value={tipoPiscinaClient}
            onChange={(e) => settipoPiscinaClient(e.target.value)}
          />
        </FormField>
        <FormField label="Valor mantención" htmlFor="cliente-valor" required>
          <FormInput
            id="cliente-valor"
            inputMode="numeric"
            placeholder="$0"
            value={inputValue}
            onChange={(e) => handlePriceChange(e.target.value)}
            onFocus={() =>
              setInputValue(
                valorMantencionClient ? String(valorMantencionClient) : "",
              )
            }
            onBlur={handlePriceBlur}
          />
        </FormField>
        <FormField label="Día de mantención" htmlFor="cliente-dia" required>
          <FormSelect
            id="cliente-dia"
            placeholder="Elegir día..."
            options={opcionesSinVacio(dias)}
            value={diaMantencionClient}
            onChange={(e) => setDiaMantencionClient(e.target.value)}
          />
        </FormField>
        <FormField
          label="Periodicidad de visitas"
          htmlFor="cliente-frecuencia"
          required
        >
          <FormSelect
            id="cliente-frecuencia"
            placeholder="Elegir periodicidad..."
            options={opcionesFrecuencia}
            value={frecuenciaClient}
            onChange={(e) => setFrecuenciaClient(e.target.value)}
          />
        </FormField>
        <FormDate
          full
          label="Fecha de ingreso"
          placeholder="Hoy, si no se elige"
          initialDate={fechaIngresoClient ?? undefined}
          onSave={(fecha) => setFechaIngresoClient(fecha)}
        />
      </FormSection>

      <FormSection title="Adicional" icon={<SettingsIcon fontSize="inherit" />}>
        <FormField
          label="Observación"
          htmlFor="cliente-observacion"
          hint="(opcional)"
          full
        >
          <FormTextarea
            id="cliente-observacion"
            placeholder="Detalles adicionales sobre el cliente o la piscina..."
            value={observacionClient}
            onChange={(e) => setObservacionClient(e.target.value)}
          />
        </FormField>
        {isEditMode && (
          <FormField label="Estado del cliente" full>
            <FormToggle
              name="cliente-activo"
              value={isActiveClient}
              onChange={setIsActiveClient}
              labelYes="Activo"
              labelNo="Inactivo"
            />
          </FormField>
        )}
      </FormSection>
    </FormSheet>
  );
};

export default CreateClientDialog;
