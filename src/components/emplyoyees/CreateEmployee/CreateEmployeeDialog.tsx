import { useEffect, useState } from "react";
import type { IEmployee } from "../../../service/employee.interface";

// UI Components
import Button from "../../ui/button/Button";
import FormSheet from "../../ui/formSheet/FormSheet";
import {
  FormCell,
  FormDate,
  FormField,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from "../../ui/formSheet/FormFields";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import NotesIcon from "@mui/icons-material/Notes";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { grupos } from "../../../constant/employees.contant";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "../../../hooks/EmployeeHooks";
import {
  formatDateToLocalString,
  parseDateLocal,
} from "../../../utils/DateUtils";

const ESTADOS_EMPLEADO = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "LICENCIA", label: "Licencia" },
  { value: "VACACIONES", label: "Vacaciones" },
];

const TIPOS_CONTRATO = [
  { value: "INDEFINIDO", label: "Indefinido" },
  { value: "PLAZO_FIJO", label: "Plazo Fijo" },
  { value: "HONORARIOS", label: "Honorarios" },
  { value: "PART_TIME", label: "Part Time" },
];

// 1. Definimos un estado inicial limpio para evitar problemas con null
const INITIAL_EMPLOYEE_STATE: Partial<IEmployee> = {
    nombre: "",
    apellido: "",
    rut: "",
    dv: "",
    email: "",
    telefono: "",
    direccion: "",
    sueldo: 0,
    tipoContrato: "",
    estado: "ACTIVO",
    grupo: "",
    notas: ""
};

interface CreateEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeInfo?: IEmployee;
  viewMode?: "create" | "edit" | "view" | "delete";
}

const CreateEmployeeDialog = ({
  isOpen,
  onClose,
  employeeInfo,
  viewMode = "create",
}: CreateEmployeeDialogProps) => {
  const employeeCreateMutation = useCreateEmployee();
  const employeeUpdateMutation = useUpdateEmployee();
  const employeeDeleteMutation = useDeleteEmployee();

  // 2. Inicializamos con un objeto parcial en lugar de null
  const [employeeState, setEmployeeState] = useState<Partial<IEmployee>>(INITIAL_EMPLOYEE_STATE);

  // 3. Mantenemos las fechas aparte para el calendario, pero las sincronizaremos al guardar
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaTermino, setFechaTermino] = useState<Date | undefined>(undefined);
  const [sueldoInput, setSueldoInput] = useState<string>("");

  const isViewOnly = viewMode === "view";

  const handleTitle = () => {
    if (viewMode === "create") return "Crear Nuevo Empleado";
    if (viewMode === "edit") return "Editar Empleado";
    if (viewMode === "view") return "Detalles del Empleado";
    if (viewMode === "delete") return "Eliminar Empleado";
    return "";
  };

  useEffect(() => {
    if ((viewMode === "edit" || viewMode === "view" || viewMode === "delete") && employeeInfo) {
      setEmployeeState(employeeInfo);

      // Sincronizar estados auxiliares
      setSueldoInput(formatCurrency(employeeInfo.sueldo || 0));
      setFechaInicio(parseDateLocal(employeeInfo.fechaInicioContrato));
      setFechaTermino(parseDateLocal(employeeInfo.fechaFinContrato));
    } else {
      clearForm();
    }
  }, [employeeInfo, viewMode, isOpen]);

  const clearForm = () => {
    setEmployeeState(INITIAL_EMPLOYEE_STATE); // Usamos el objeto inicial
    setSueldoInput("");
    setFechaInicio(undefined);
    setFechaTermino(undefined);
  };

  const formatCurrency = (value: number) => {
    return Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  const handleSueldoChange = (value: string) => {
    const numeric = value.replace(/[^\d]/g, "");
    setSueldoInput(numeric); // Actualizamos el input visual

    // 4. Simplificamos la actualización del estado (ya no necesitamos comprobar si es null)
    setEmployeeState((prev) => ({
        ...prev,
        sueldo: Number(numeric),
    }));
  };

  const handleSueldoBlur = () => {
    if (employeeState.sueldo !== undefined && !isNaN(employeeState.sueldo)) {
      setSueldoInput(formatCurrency(employeeState.sueldo));
    }
  };

  // Función genérica para actualizar campos de texto
  const handleChangeField = (field: keyof IEmployee, value: string) => {
      setEmployeeState(prev => ({
          ...prev,
          [field]: value
      }));
  };

  const handleSave = () => {
    // 5. Construimos el payload combinando el employeeState y los estados de fechas
    const payload: IEmployee = {
      nombre: employeeState.nombre || "",
      apellido: employeeState.apellido || "",
      rut: employeeState.rut || "",
      dv: employeeState.dv || "",
      email: employeeState.email || "",
      telefono: employeeState.telefono || "",
      direccion: employeeState.direccion || "",
      // Columnas `date`: se mandan como "YYYY-MM-DD" local, nunca via
      // toISOString(), que pasa a UTC. El fin vacio va como null para que
      // una edicion pueda borrarlo (el backend lo llama fechaFinContrato;
      // antes se enviaba fechaTerminoContrato y se perdia).
      fechaInicioContrato: fechaInicio ? formatDateToLocalString(fechaInicio) : "",
      fechaFinContrato: fechaTermino ? formatDateToLocalString(fechaTermino) : null,
      sueldo: employeeState.sueldo || 0,
      tipoContrato: employeeState.tipoContrato || "",
      estado: employeeState.estado || "ACTIVO",
      grupo: employeeState.grupo || "",
      notas: employeeState.notas || "",
      ...(employeeInfo?.id && { id: employeeInfo.id }),
    };

    if (viewMode === "create") {
      employeeCreateMutation.mutate(payload);
    }
    if (viewMode === "edit" && employeeInfo?.id) {
      employeeUpdateMutation.mutate({
        employeeId: employeeInfo.id,
        employeeData: payload,
      });
    }
    if (viewMode === "delete" && employeeInfo?.id) {
      employeeDeleteMutation.mutate(employeeInfo.id);
    }
    onClose();
  };

  const nombreCompleto = [employeeState.nombre, employeeState.apellido]
    .filter(Boolean)
    .join(" ");

  const renderBody = () => {
    if (viewMode === "delete") {
      return (
        <FormSection
          title="Confirmar eliminación"
          icon={<DeleteIcon fontSize="inherit" />}
        >
          <FormCell full>
            <p className="m-0">
              ¿Estás seguro de que deseas eliminar este empleado?
            </p>
            <strong>{nombreCompleto}</strong>
          </FormCell>
        </FormSection>
      );
    }

    return (
      <>
        <FormSection
          title="Información personal"
          icon={<PersonIcon fontSize="inherit" />}
        >
          <FormField label="Nombres" htmlFor="empleado-nombre">
            <FormInput
              id="empleado-nombre"
              autoComplete="given-name"
              autoCapitalize="words"
              value={employeeState.nombre || ""}
              onChange={(e) => handleChangeField("nombre", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Apellidos" htmlFor="empleado-apellido">
            <FormInput
              id="empleado-apellido"
              autoComplete="family-name"
              autoCapitalize="words"
              value={employeeState.apellido || ""}
              onChange={(e) => handleChangeField("apellido", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="RUT (sin DV)" htmlFor="empleado-rut">
            <FormInput
              id="empleado-rut"
              inputMode="numeric"
              autoComplete="off"
              placeholder="12345678"
              maxLength={8}
              value={employeeState.rut || ""}
              onChange={(e) => handleChangeField("rut", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="DV" htmlFor="empleado-dv">
            <FormInput
              id="empleado-dv"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="K"
              maxLength={1}
              value={employeeState.dv || ""}
              onChange={(e) =>
                handleChangeField("dv", e.target.value.slice(0, 1))
              }
              disabled={isViewOnly}
            />
          </FormField>
        </FormSection>

        <FormSection title="Contacto" icon={<PhoneIcon fontSize="inherit" />}>
          <FormField label="Email" htmlFor="empleado-email" hint="(opcional)">
            <FormInput
              id="empleado-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={employeeState.email || ""}
              onChange={(e) => handleChangeField("email", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Teléfono" htmlFor="empleado-telefono">
            <FormInput
              id="empleado-telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+56 9 1234 5678"
              value={employeeState.telefono || ""}
              onChange={(e) => handleChangeField("telefono", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Dirección" htmlFor="empleado-direccion" full>
            <FormInput
              id="empleado-direccion"
              autoComplete="street-address"
              value={employeeState.direccion || ""}
              onChange={(e) => handleChangeField("direccion", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Datos laborales"
          icon={<WorkIcon fontSize="inherit" />}
        >
          <FormDate
            label="Fecha inicio contrato"
            require
            initialDate={fechaInicio}
            onSave={(fecha) => setFechaInicio(fecha ?? undefined)}
            disabled={isViewOnly}
          />
          <FormDate
            label="Fecha término (opcional)"
            initialDate={fechaTermino}
            onSave={(fecha) => setFechaTermino(fecha ?? undefined)}
            disabled={isViewOnly}
          />
          <FormField label="Sueldo base" htmlFor="empleado-sueldo">
            <FormInput
              id="empleado-sueldo"
              inputMode="numeric"
              placeholder="$0"
              value={sueldoInput}
              onChange={(e) => handleSueldoChange(e.target.value)}
              onBlur={handleSueldoBlur}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField
            label="Tipo de contrato"
            htmlFor="empleado-contrato"
            required
          >
            <FormSelect
              id="empleado-contrato"
              placeholder="Seleccione..."
              options={TIPOS_CONTRATO}
              value={employeeState.tipoContrato || ""}
              onChange={(e) =>
                handleChangeField("tipoContrato", e.target.value)
              }
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Grupo" htmlFor="empleado-grupo" required>
            <FormSelect
              id="empleado-grupo"
              placeholder="Seleccione..."
              options={grupos}
              value={employeeState.grupo || ""}
              onChange={(e) => handleChangeField("grupo", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Estado" htmlFor="empleado-estado" required>
            <FormSelect
              id="empleado-estado"
              placeholder="Seleccione..."
              options={ESTADOS_EMPLEADO}
              value={employeeState.estado || ""}
              onChange={(e) => handleChangeField("estado", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
        </FormSection>

        <FormSection title="Notas" icon={<NotesIcon fontSize="inherit" />}>
          <FormField
            label="Notas / observaciones"
            htmlFor="empleado-notas"
            hint="(opcional)"
            full
          >
            <FormTextarea
              id="empleado-notas"
              placeholder="Ingrese información adicional aquí..."
              value={employeeState.notas || ""}
              onChange={(e) => handleChangeField("notas", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
        </FormSection>
      </>
    );
  };

  return (
    <FormSheet
      open={isOpen}
      onClose={onClose}
      title={handleTitle()}
      subtitle={
        viewMode === "create"
          ? "Los campos con * son obligatorios"
          : nombreCompleto || undefined
      }
      size={viewMode === "delete" ? "md" : "lg"}
      footer={
        <>
          <Button
            label={isViewOnly ? "Cerrar" : "Cancelar"}
            variant="tertiary"
            onClick={onClose}
          />
          {!isViewOnly && (
            <Button
              label={viewMode === "delete" ? "Eliminar" : "Guardar"}
              variant={viewMode === "delete" ? "destructive" : "primary"}
              icon={viewMode === "delete" ? <DeleteIcon /> : <SaveIcon />}
              onClick={handleSave}
            />
          )}
        </>
      }
    >
      {renderBody()}
    </FormSheet>
  );
};

export default CreateEmployeeDialog;
