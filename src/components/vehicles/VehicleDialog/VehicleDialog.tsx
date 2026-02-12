/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
// UI Components
import CustomInputText from "../../ui/InputText/CustomInputText";
import Button from "../../ui/button/Button";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import BadgeIcon from "@mui/icons-material/Badge";
import SaveIcon from "@mui/icons-material/Save";

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

  const renderBody = () => {
    if (viewMode === "delete") {
      return (
        <div className="p-3">
          <h5>¿Estás seguro de que deseas eliminar este vehículo?</h5>
          <p className="font-weight-bold">
            {vehicleState.marca} {vehicleState.modelo} - {vehicleState.placa}
          </p>
        </div>
      );
    } else {
      return (
        <div className="container-fluid">
          <h6 className="mb-3 text-muted border-bottom pb-2">
            Información Vehículo
          </h6>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <CustomInputText
                title="Marca"
                value={vehicleState.marca || ""}
                onChange={(val) => handleChangeField("marca", val)}
                icon={<PersonIcon />}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-4">
              <CustomInputText
                title="Modelo"
                value={vehicleState.modelo || ""}
                onChange={(val) => handleChangeField("modelo", val)}
                icon={<PersonIcon />}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-3">
              <CustomInputText
                title="Placa"
                value={vehicleState.placa || ""}
                onChange={(val) => handleChangeField("placa", val)}
                placeholder="12345678"
                icon={<BadgeIcon />}
                disabled={isViewOnly}
                maxLength={8}
              />
            </div>
            <div className="col-md-3">
              <CustomInputText
                title="Color"
                value={vehicleState.color || ""}
                onChange={(val) => handleChangeField("color", val)}
                placeholder="Blanco"
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-3">
              <CustomInputText
                title="Año"
                value={vehicleState.anio || 0}
                onChange={(val) => handleChangeField("anio", val)}
                type="number"
                require={false}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-3">
              <CustomInputText
                title="Kilometraje"
                value={vehicleState.kilometraje || 0}
                onChange={(val) => handleChangeField("kilometraje", val)}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-3">
              <CustomInputText
                title="Ultima Mantención"
                value={vehicleState.ultima_mantencion || ""}
                onChange={(val) => handleChangeField("ultima_mantencion", val)}
                icon={<HomeIcon />}
                disabled={isViewOnly}
              />
            </div>
          </div>

          <h6 className="mb-3 text-muted border-bottom pb-2">Personal</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <CustomInputText
                title="Marca"
                value={vehicleState.marca || ""}
                onChange={(val) => handleChangeField("marca", val)}
                icon={<PersonIcon />}
                disabled={isViewOnly}
              />
            </div>
            <div className="col-md-4">
              <CustomInputText
                title="Modelo"
                value={vehicleState.modelo || ""}
                onChange={(val) => handleChangeField("modelo", val)}
                icon={<PersonIcon />}
                disabled={isViewOnly}
              />
            </div>
          </div>

          <h6 className="mb-3 text-muted border-bottom pb-2">Documentos</h6>
          <div className="row g-3 mb-4">
            {vehicleInfo?.files?.map((file) => (
              <DownloadFile key={file.id} file={file} />
            ))}
            <UploadFileContainer
              files={uploadedFiles}
              setFiles={setUploadedFiles}
            />
          </div>
        </div>
      );
    }
  };

  const handleClose = () => {
    onClose();
    setVehicleState(INITIAL_VEHICLE_STATE);
    setUploadedFiles([]);
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {viewMode === "create" && <PersonIcon color="primary" />}
          {handleTitle()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderBody()}</Modal.Body>
      <Modal.Footer>
        <div className="d-flex gap-2 justify-content-end w-100">
          <Button label="Cerrar" variant="secondary" onClick={handleClose} />
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

export default VehicleDialog;
