import { useEffect, useState } from "react";
import {
  // useCreateRepair,
  useDeleteRepair,
  // useRepairById,
  useRepairs,
  // useUpdateRepair,
} from "../../hooks/RepairsHooks";
import type { IRepair } from "../../service/repairs.interface";
import style from "../client/BodyClients/BodyClients.module.css";
import InputText from "../ui/InputText/InputText";
import TableGeneric from "../ui/table/Table";
import { formatDateToDDMMYYYY } from "../../utils/DateUtils";
import Tooltip from "@mui/material/Tooltip";
import EyeIcon from "../ui/Icons/EyeIcon";
import PencilIcon from "../ui/Icons/PencilIcon";
import TrashIcon from "../ui/Icons/TrashIcon";
import PopUp from "../ui/PopUp/PopUp";
import PlusIcon from "../ui/Icons/PlusIcon";
import InfoRepairDialog from "./InfoRepair/InfoRepairDialog";
import CreateRepairsDialog from "./CreateRepair/CreateRepairsDialog";

const titleTable = [
  {
    label: "Cliente",
    key: "clientName",
    showOrder: true,
  },
  {
    label: "Fecha creación",
    key: "creationDate",
    showOrder: true,
  },
  {
    label: "Estado",
    key: "status",
    showOrder: true,
  },
  {
    label: "Costo",
    key: "cost",
    showOrder: true,
  },
  {
    label: "Descripción",
    key: "description",
    showOrder: false,
  },
  {
    label: "Acciones",
    key: "actions",
    showOrder: false,
  },
];

interface FilterQuery {
  nombreCliente?: string;
  fechaCreacion?: string;
  estado?: string;
  costo?: number;
  valor?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

const BodyRepairs = () => {
  const reparisMutation = useRepairs();
  // const repairsMutationId = useRepairById();
  // const createRepairMutation = useCreateRepair();
  // const updateRepairMutation = useUpdateRepair();
  const deleteRepairMutation = useDeleteRepair();

  const [repairs, setRepairs] = useState<IRepair[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [filterQuery, setFilterQuery] = useState<FilterQuery>({});

  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<IRepair | null>(null);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const response = await reparisMutation.mutateAsync();
      setRepairs(response);
    } catch (error) {
      console.error("Error fetching repairs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

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
      <div>
        <div className={style.filtersContainer}>
          <InputText
            title="Buscar por cliente"
            value={filterQuery.nombreCliente || ""}
            onChange={(value: string) =>
              setFilterQuery({ ...filterQuery, nombreCliente: value })
            }
          />
          {hasFilters && (
            <button onClick={handleClearFilters}>Limpiar filtros</button>
          )}
          <Tooltip title="Crear nueva Reparación" arrow leaveDelay={0}>
            <button onClick={handleOpenCreateDialog}>
              <PlusIcon />
            </button>
          </Tooltip>
        </div>
      </div>
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
                <td className="flex flex-col gap-2 sm:gap-4 items-center justify-center">
                  <Tooltip title="Ver detalles Reparación" arrow leaveDelay={0}>
                    <button
                      className="actions"
                      onClick={() => handleOpenDialog(repair)}
                    >
                      <EyeIcon size={24} skipClick />
                    </button>
                  </Tooltip>
                  <Tooltip title="Editar Reparación" arrow leaveDelay={0}>
                    <button onClick={() => handleEditRepair(repair)}>
                      <PencilIcon color="white" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Eliminar Reparación" arrow leaveDelay={0}>
                    <button
                      onClick={() =>
                        repair.id !== undefined && handleOpenDeletePopUp(repair)
                      }
                    >
                      <TrashIcon className={style.iconAction} />
                    </button>
                  </Tooltip>
                </td>
              </tr>
            );
          }}
        />
      </div>
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
      <PopUp
        open={openPopUp}
        onClose={handleClosePopUp}
        onConfirm={() => {
          handleDeleteRepair(selectedRepair?.id ?? "");
        }}
        title="Confirmar eliminación"
        confirmText="Eliminar"
      >
        <div className="flex flex-col gap-4 text-center">
          <p>¿Estás seguro de que deseas eliminar esta reparación?</p>
          <p className="font-bold">
            {" "}
            Reparación de {selectedRepair?.client.nombre}
          </p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
      </PopUp>
    </div>
  );
};

export default BodyRepairs;
