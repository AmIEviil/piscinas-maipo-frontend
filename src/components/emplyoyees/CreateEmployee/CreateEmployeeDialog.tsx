import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import type { IEmployee } from "../../../service/employee.interface";

// UI Components
import CustomInputText from "../../ui/InputText/CustomInputText";
import CustomSelect from "../../ui/Select/Select";
import DatePicker from "../../ui/calendar/DatePicker";
import Button from "../../ui/button/Button";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import PaidIcon from "@mui/icons-material/Paid";
import BadgeIcon from "@mui/icons-material/Badge";
import WorkIcon from "@mui/icons-material/Work";
import GroupsIcon from "@mui/icons-material/Groups";
import SaveIcon from "@mui/icons-material/Save";
import BlockIcon from "@mui/icons-material/Block";
import { CustomTextArea } from "../../ui/InputText/CustonTextArea";
import { grupos } from "../../../constant/employees.contant";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "../../../hooks/EmployeeHooks";

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
  
  // 3. Mantenemos las fechas aparte para el DatePicker, pero las sincronizaremos al guardar
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
      setFechaInicio(employeeInfo.fechaInicioContrato ? new Date(employeeInfo.fechaInicioContrato) : undefined);
      setFechaTermino(employeeInfo.fechaTerminoContrato ? new Date(employeeInfo.fechaTerminoContrato) : undefined);
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
      // Usamos las variables de estado de fecha directamente:
      fechaInicioContrato: fechaInicio ? fechaInicio.toISOString() : "", 
      fechaTerminoContrato: fechaTermino ? fechaTermino.toISOString() : undefined,
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

  const renderBody = () => {
    if (viewMode === "delete") {
      return (
        <div className="p-3">
          <h5>¿Estás seguro de que deseas eliminar este empleado?</h5>
          <p className="font-weight-bold">
            {employeeState.nombre} {employeeState.apellido}
          </p>
        </div>
      );
    } else {
      return (
        <div className="container-fluid">
          <h6 className="mb-3 text-muted border-bottom pb-2">
            Información Personal
          </h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <CustomInputText
                title="Nombres"
                value={employeeState.nombre || ""}
                onChange={(val) => handleChangeField("nombre", val)} // Uso simplificado
                icon={<PersonIcon />}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-6">
              <CustomInputText
                title="Apellidos"
                value={employeeState.apellido || ""}
                onChange={(val) => handleChangeField("apellido", val)}
                icon={<PersonIcon />}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-8">
              <CustomInputText
                title="RUT (sin DV)"
                value={employeeState.rut || ""}
                onChange={(val) => handleChangeField("rut", val)}
                placeholder="12345678"
                icon={<BadgeIcon />}
                disabled={isViewOnly}
                maxLength={8}
              />
            </div>
            <div className="col-md-4">
              <CustomInputText
                title="DV"
                value={employeeState.dv || ""}
                onChange={(val) => handleChangeField("dv", val.slice(0, 1))}
                placeholder="K"
                disabled={isViewOnly}
                maxLength={1}
              />
            </div>
          </div>

          {/* Contacto */}
          <h6 className="mb-3 text-muted border-bottom pb-2">Contacto</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <CustomInputText
                title="Email"
                value={employeeState.email || ""}
                onChange={(val) => handleChangeField("email", val)}
                icon={<EmailIcon />}
                type="email"
                require={false}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-6">
              <CustomInputText
                title="Teléfono"
                value={employeeState.telefono || ""}
                onChange={(val) => handleChangeField("telefono", val)}
                icon={<PhoneIcon />}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-12">
              <CustomInputText
                title="Dirección"
                value={employeeState.direccion || ""}
                onChange={(val) => handleChangeField("direccion", val)}
                icon={<HomeIcon />}
                disabled={isViewOnly}
              />
            </div>
          </div>

          {/* Información Laboral */}
          <h6 className="mb-3 text-muted border-bottom pb-2">
            Datos Laborales
          </h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label className="input-title" style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>
                  Fecha Inicio Contrato <span className="required">*</span>
                </label>
                <DatePicker
                  value={fechaInicio ? dayjs(fechaInicio) : undefined}
                  onChange={setFechaInicio} // Actualiza el estado local de fecha
                />
              </div>
            </div>
            <div className="col-md-6">
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label className="input-title" style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>
                  Fecha Término (Opcional)
                </label>
                <DatePicker
                  value={fechaTermino ? dayjs(fechaTermino) : undefined}
                  onChange={setFechaTermino} // Actualiza el estado local de fecha
                />
              </div>
            </div>

            <div className="col-md-6">
              <CustomInputText
                title="Sueldo Base"
                value={sueldoInput}
                onChange={handleSueldoChange}
                onBlur={handleSueldoBlur}
                icon={<PaidIcon />}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-6">
              <CustomSelect
                title="Tipo de Contrato"
                label="Seleccione..."
                options={TIPOS_CONTRATO}
                value={employeeState.tipoContrato || ""}
                onChange={(e) => handleChangeField("tipoContrato", String(e.target.value))}
                icon={<WorkIcon />}
                disabled={isViewOnly}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomSelect
                title="Grupo "
                label="Seleccione..."
                options={grupos}
                value={employeeState.grupo || ""}
                onChange={(e) => handleChangeField("grupo", String(e.target.value))}
                icon={<GroupsIcon />}
                disabled={isViewOnly}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomSelect
                title="Estado"
                label="Seleccione..."
                options={ESTADOS_EMPLEADO}
                value={employeeState.estado || ""}
                onChange={(e) => handleChangeField("estado", String(e.target.value))}
                icon={<BlockIcon />}
                disabled={isViewOnly}
                required
              />
            </div>
          </div>

          {/* Notas */}
          <div className="row">
            <div className="col-12">
              <CustomTextArea
                title="Notas / Observaciones"
                value={employeeState.notas || ""}
                onChange={(val) => handleChangeField("notas", val)} // Asumiendo que CustomTextArea devuelve string directo
                disabled={isViewOnly}
                placeholder="Ingrese información adicional aquí..."
              />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {viewMode === "create" && <PersonIcon color="primary" />}
          {handleTitle()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderBody()}</Modal.Body>
      <Modal.Footer>
        <div className="d-flex gap-2 justify-content-end w-100">
          <Button label="Cerrar" variant="secondary" onClick={onClose} />
          {!isViewOnly && (
            <Button
              label="Guardar"
              variant="primary"
              icon={<SaveIcon />}
              onClick={handleSave}
            />
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateEmployeeDialog;