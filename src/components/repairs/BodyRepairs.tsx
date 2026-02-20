/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useDeleteRepair, useRepairs } from "../../hooks/RepairsHooks";
import type { IRepair } from "../../service/repairs.interface";
import style from "../client/BodyClients/BodyClients.module.css";
import InputText from "../ui/InputText/InputText";
import TableGeneric from "../ui/table/Table";
import { formatDateToDDMMYYYY } from "../../utils/DateUtils";
import Tooltip from "@mui/material/Tooltip";
import PlusIcon from "../ui/Icons/PlusIcon";
import InfoRepairDialog from "./InfoRepair/InfoRepairDialog";
import CreateRepairsDialog from "./CreateRepair/CreateRepairsDialog";
import { ActionsTdTable } from "../common/ActionsTable/ActionsTable";
import CustomModal from "../ui/modal/CustomModal";
import { titleTable } from "../../constant/constantBodyReparis";

export interface FilterQueryRepairs {
  nombreCliente?: string;
  fechaCreacion?: string;
  estado?: string;
  costo?: number;
  valor?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

interface BodyRepairsProps {
  nombreCliente?: string;
  showFilters?: boolean;
}

const BodyRepairs = ({
  nombreCliente,
  showFilters = true,
}: BodyRepairsProps) => {
  const reparisMutation = useRepairs();
  const deleteRepairMutation = useDeleteRepair();

  const [repairs, setRepairs] = useState<IRepair[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [filterQuery, setFilterQuery] = useState<FilterQueryRepairs>(() =>
    nombreCliente ? { nombreCliente } : {},
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<IRepair | null>(null);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const response = await reparisMutation.mutateAsync(filterQuery);
      setRepairs(response);
    } catch (error) {
      console.error("Error fetching repairs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, [filterQuery]);

  const handleClearFilters = () => {
    setFilterQuery({});
  };

  const hasFilters = Object.keys(filterQuery).length > 0;

  const handleClosePopUp = () => {
    setOpenPopUp(false);
  };

  const handleOpenDialog = async (repair: IRepair) => {
    setSelectedRepair(repair);
    setOpenDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenCreateDialog(false);
    setIsEditMode(false);
    setSelectedRepair(null);
    fetchRepairs();
  };

  const handleOpenDeletePopUp = (repair: IRepair) => {
    setSelectedRepair(repair);
    setOpenPopUp(true);
  };

  const handleEditRepair = (repair: IRepair) => {
    setSelectedRepair(repair);
    setIsEditMode(true);
    setOpenCreateDialog(true);
  };

  const handleDeleteRepair = async (id: string) => {
    try {
      await deleteRepairMutation.mutateAsync(id);
      fetchRepairs();
      setOpenPopUp(false);
    } catch (error) {
      console.error("Error eliminando al revestimiento:", id, error);
    }
  };

  return (
    <div>
      {showFilters ? (
        <div className={style.filtersContainer}>
          <InputText
            title="Buscar por cliente"
            value={filterQuery.nombreCliente || ""}
            onChange={(value: string) =>
              setFilterQuery({ ...filterQuery, nombreCliente: value })
            }
          />
          <div className="flex gap-2 items-center">
            {hasFilters && (
              <button onClick={handleClearFilters}>Limpiar filtros</button>
            )}
            <Tooltip title="Crear nueva Reparación" arrow leaveDelay={0}>
              <button
                onClick={handleOpenCreateDialog}
                className="flex items-center gap-2"
              >
                Crear reparación
                <PlusIcon />
              </button>
            </Tooltip>
          </div>
        </div>
      ) : (
        <Tooltip title="Crear nueva Reparación" arrow leaveDelay={0}>
          <button
            onClick={handleOpenCreateDialog}
            className="flex items-center gap-2"
          >
            Crear reparación
            <PlusIcon />
          </button>
        </Tooltip>
      )}
      {repairs.length === 0 && !loading && nombreCliente ? (
        <div className={style.noData}>
          El Cliente no tiene reparaciones registradas.
        </div>
      ) : (
        <div className={style.tableContainer}>
          <TableGeneric
            titles={titleTable}
            data={repairs}
            loading={loading}
            renderRow={(repair) => {
              return (
                <tr key={repair.id}>
                  <td>{repair.client.nombre}</td>
                  <td>{formatDateToDDMMYYYY(repair.fecha_ingreso)}</td>
                  <td>{repair.estado}</td>
                  <td>{repair.costo_reparacion}</td>
                  <td>{repair.detalles}</td>
                  <td>
                    <ActionsTdTable
                      onView={() => handleOpenDialog(repair)}
                      onEdit={() => handleEditRepair(repair)}
                      onDelete={() =>
                        repair.id !== undefined && handleOpenDeletePopUp(repair)
                      }
                    />
                  </td>
                </tr>
              );
            }}
          />
        </div>
      )}
      <InfoRepairDialog
        open={openDialog}
        repairInfo={selectedRepair ?? undefined}
        onClose={handleCloseDialog}
      />
      <CreateRepairsDialog
        open={openCreateDialog}
        onClose={handleCloseDialog}
        repairInfo={selectedRepair ?? undefined}
        isEditMode={isEditMode}
      />
      <CustomModal
        open={openPopUp}
        onClose={handleClosePopUp}
        onConfirm={() => {
          handleDeleteRepair(selectedRepair?.id ?? "");
        }}
        title="Confirmar eliminación"
        confirmLabel="Eliminar"
        content={
          <div className="flex flex-col gap-4 text-center">
            <p>¿Estás seguro de que deseas eliminar esta reparación?</p>
            <p className="font-bold">
              Reparación de {selectedRepair?.client.nombre}
            </p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
        }
      />
    </div>
  );
};

export default BodyRepairs;
