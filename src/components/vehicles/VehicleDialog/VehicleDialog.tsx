/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
// UI Components
import Button from "../../ui/button/Button";
import FormSheet from "../../ui/formSheet/FormSheet";
import {
  FormCell,
  FormField,
  FormInput,
  FormSection,
} from "../../ui/formSheet/FormFields";

// Icons
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SpeedIcon from "@mui/icons-material/Speed";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

import type {
  IVehicle,
  IVehicleResponse,
} from "../../../service/vehicle.interface";
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
} from "../../../hooks/VehiclesHooks";
import DownloadFile from "../../common/DownloadFile/DownloadFile";
import UploadFileContainer from "../../common/UploadFile/UploadFileContainer";

// 1. Definimos un estado inicial limpio para evitar problemas con null
const INITIAL_VEHICLE_STATE: Partial<IVehicle> = {
  placa: "",
  marca: "",
  modelo: "",
  anio: undefined,
  color: "",
  isActive: true,
};

interface VehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleInfo?: IVehicleResponse;
  viewMode?: "create" | "edit" | "view" | "delete";
}

const VehicleDialog = ({
  isOpen,
  onClose,
  vehicleInfo,
  viewMode = "create",
}: VehicleDialogProps) => {
  const vehicleCreateMutation = useCreateVehicle();
  const vehicleUpdateMutation = useUpdateVehicle();
  const vehicleDeleteMutation = useDeleteVehicle();

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [vehicleState, setVehicleState] = useState<Partial<IVehicle>>(
    INITIAL_VEHICLE_STATE,
  );
  const isViewOnly = viewMode === "view";

  const handleTitle = () => {
    if (viewMode === "create") return "Crear Nuevo Vehículo";
    if (viewMode === "edit") return "Editar Vehículo";
    if (viewMode === "view") return "Detalles del Vehículo";
    if (viewMode === "delete") return "Eliminar Vehículo";
    return "";
  };

  useEffect(() => {
    if (
      (viewMode === "edit" || viewMode === "view" || viewMode === "delete") &&
      vehicleInfo
    ) {
      setVehicleState(vehicleInfo.vehicle);
    } else {
      clearForm();
    }
  }, [vehicleInfo, viewMode, isOpen]);

  const clearForm = () => {
    setVehicleState(INITIAL_VEHICLE_STATE);
  };

  // Función genérica para actualizar campos de texto
  const handleChangeField = (field: keyof IVehicle, value: string) => {
    setVehicleState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // 5. Construimos el payload combinando el employeeState y los estados de fechas
    const payload: IVehicle = {
      marca: vehicleState.marca || "",
      modelo: vehicleState.modelo || "",
      placa: vehicleState.placa || "",
      anio: vehicleState.anio || 0,
      color: vehicleState.color || "",
      isActive: vehicleState.isActive ?? true,
      kilometraje: vehicleState.kilometraje || 0,
      ultima_mantencion: vehicleState.ultima_mantencion || "",
    };

    if (viewMode === "create") {
      vehicleCreateMutation.mutate(payload);
    }
    if (viewMode === "edit" && vehicleInfo?.vehicle.placa) {
      vehicleUpdateMutation.mutate({
        patente: vehicleInfo.vehicle.placa,
        vehicleData: payload,
      });
    }
    if (viewMode === "delete" && vehicleInfo?.vehicle.placa) {
      vehicleDeleteMutation.mutate(vehicleInfo.vehicle.placa);
    }
    onClose();
  };

  const descripcionVehiculo = [
    [vehicleState.marca, vehicleState.modelo].filter(Boolean).join(" "),
    vehicleState.placa,
  ]
    .filter(Boolean)
    .join(" - ");

  const renderBody = () => {
    if (viewMode === "delete") {
      return (
        <FormSection
          title="Confirmar eliminación"
          icon={<DeleteIcon fontSize="inherit" />}
        >
          <FormCell full>
            <p className="m-0">
              ¿Estás seguro de que deseas eliminar este vehículo?
            </p>
            <strong>
              {vehicleState.marca} {vehicleState.modelo} - {vehicleState.placa}
            </strong>
          </FormCell>
        </FormSection>
      );
    }

    return (
      <>
        <FormSection
          title="Información vehículo"
          icon={<DirectionsCarIcon fontSize="inherit" />}
        >
          <FormField label="Marca" htmlFor="vehiculo-marca">
            <FormInput
              id="vehiculo-marca"
              autoComplete="off"
              autoCapitalize="words"
              value={vehicleState.marca || ""}
              onChange={(e) => handleChangeField("marca", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Modelo" htmlFor="vehiculo-modelo">
            <FormInput
              id="vehiculo-modelo"
              autoComplete="off"
              autoCapitalize="words"
              value={vehicleState.modelo || ""}
              onChange={(e) => handleChangeField("modelo", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Placa" htmlFor="vehiculo-placa">
            <FormInput
              id="vehiculo-placa"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="ABCD12"
              maxLength={8}
              value={vehicleState.placa || ""}
              onChange={(e) => handleChangeField("placa", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Color" htmlFor="vehiculo-color">
            <FormInput
              id="vehiculo-color"
              autoComplete="off"
              placeholder="Blanco"
              value={vehicleState.color || ""}
              onChange={(e) => handleChangeField("color", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          <FormField label="Año" htmlFor="vehiculo-anio">
            <FormInput
              id="vehiculo-anio"
              type="number"
              inputMode="numeric"
              autoComplete="off"
              value={vehicleState.anio || 0}
              onChange={(e) => handleChangeField("anio", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Uso y mantención"
          icon={<SpeedIcon fontSize="inherit" />}
        >
          <FormField label="Kilometraje" htmlFor="vehiculo-km">
            <FormInput
              id="vehiculo-km"
              inputMode="numeric"
              autoComplete="off"
              value={vehicleState.kilometraje || 0}
              onChange={(e) => handleChangeField("kilometraje", e.target.value)}
              disabled={isViewOnly}
            />
          </FormField>
          {/* Texto libre como antes: el API recibe el string tal cual */}
          <FormField label="Última mantención" htmlFor="vehiculo-mantencion">
            <FormInput
              id="vehiculo-mantencion"
              autoComplete="off"
              value={vehicleState.ultima_mantencion || ""}
              onChange={(e) =>
                handleChangeField("ultima_mantencion", e.target.value)
              }
              disabled={isViewOnly}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Documentos"
          icon={<AttachFileIcon fontSize="inherit" />}
        >
          {vehicleInfo?.files && vehicleInfo.files.length > 0 && (
            <FormCell full>
              {/* DownloadFile trae col-md-4: necesita una fila de Bootstrap */}
              <div className="row g-2">
                {vehicleInfo.files.map((file) => (
                  <DownloadFile key={file.id} file={file} />
                ))}
              </div>
            </FormCell>
          )}
          <FormCell full>
            <UploadFileContainer
              files={uploadedFiles}
              setFiles={setUploadedFiles}
            />
          </FormCell>
        </FormSection>
      </>
    );
  };

  const handleClose = () => {
    onClose();
    setVehicleState(INITIAL_VEHICLE_STATE);
    setUploadedFiles([]);
  };

  return (
    <FormSheet
      open={isOpen}
      onClose={handleClose}
      title={handleTitle()}
      subtitle={
        viewMode === "create" ? undefined : descripcionVehiculo || undefined
      }
      size={viewMode === "delete" ? "md" : "lg"}
      footer={
        <>
          <Button
            label={isViewOnly ? "Cerrar" : "Cancelar"}
            variant="tertiary"
            onClick={handleClose}
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

export default VehicleDialog;
