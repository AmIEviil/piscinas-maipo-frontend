import { useEffect, useMemo, useState } from "react";
import {
  useDeleteRevestimiento,
  useRevestimiento,
  useRevestimientoById,
} from "../../hooks/RevestimientoHooks";
import type { IRevestimiento } from "../../service/revestimientoInterface";
import style from "../client/BodyClients/BodyClients.module.css";
import TableGeneric from "../ui/table/Table";
import Tooltip from "@mui/material/Tooltip";

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { formatMoneyNumber } from "../../utils/formatTextUtils";
import { formatNoResultsText } from "../../utils/FiltersUtils";
import InputText from "../ui/InputText/InputText";
import debounce from "lodash.debounce";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import PopUp from "../ui/PopUp/PopUp";
import InfoRevestimientoDialog from "./InfoClient/InfoDialogRevestimiento";
import CreateRevestimientoDialog from "./CreateRevestimiento/CreateRevestimientoDialog";
import CustomSelect from "../ui/Select/Select";
import { tiposPiscinasMaterial } from "../../constant/constantBodyClient";
import DatePickers from "../ui/calendar/DatePicker";
import dayjs from "dayjs";

const titlesTable = [
  { label: "Cliente", showOrderBy: false },
  { label: "Fecha Creación", showOrderBy: true },
  { label: "Tipo Revestimiento", showOrderBy: true },
  { label: "Descripción", showOrderBy: true },
  { label: "Valor Total", showOrderBy: true },
  { label: "Extras", showOrderBy: false },
  { label: "Acciones", showOrderBy: false },
];

interface FilterQuery {
  nombreCliente?: string;
  fechaCreacion?: string;
  tipoRevestimiento?: string;
  estado?: string;
}

const BodyRevestimiento = () => {
  const revestimientoMutation = useRevestimiento();
  const revestimientoByIdMutation = useRevestimientoById();
  const deleteRevestimientoMutation = useDeleteRevestimiento();

  const [revestimientos, setRevestimientos] = useState<IRevestimiento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [filterQuery, setFilterQuery] = useState<FilterQuery>({});
  const [selectedRevestimiento, setSelectedRevestimiento] =
    useState<IRevestimiento | null>(null);
  const [revestimientoDetails, setRevestimientoDetails] =
    useState<IRevestimiento | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [nombreFilter, setNombreFilter] = useState<string>("");
  const [fechaCreacionFilter, setFechaCreacionFilter] = useState<string>("");
  const [tipoRevestimientoFilter, setTipoRevestimientoFilter] =
    useState<string>("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  const handleClosePopUp = () => {
    setOpenPopUp(false);
  };

  const handleOpenDialog = async (revestimiento: IRevestimiento) => {
    handleSeeDetailsRevestimiento(revestimiento);
    setOpenDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenCreateDialog(false);
  };

  const fetchRevestimientos = async () => {
    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const revestimientos = await revestimientoMutation.mutateAsync();
        setRevestimientos(revestimientos);
      } catch (error) {
        console.error("Error fetching revestimientos:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  };

  useEffect(() => {
    fetchRevestimientos();
  }, []);

  const handleFilterName = useMemo(
    () =>
      debounce((value: string) => {
        setFilterQuery((prev) => {
          if (value.length >= 3) {
            return { ...prev, nombre: value };
          } else if (value.length === 0) {
            const updated = { ...prev };
            delete updated.nombreCliente;
            return updated;
          }
          return prev ?? {};
        });
      }, 500),
    []
  );

  const handleSeeDetailsRevestimiento = async (
    revestimiento: IRevestimiento
  ) => {
    try {
      if (!revestimiento.id) return;
      const revestimientoDetails = await revestimientoByIdMutation.mutateAsync(
        revestimiento.id
      );
      setRevestimientoDetails(revestimientoDetails);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error cargando mantenciones:", error);
    }
  };

  const handleClearFilter = () => {
    setFilterQuery({});
    setNombreFilter("");
    setFechaCreacionFilter("");
    setTipoRevestimientoFilter("");
    setEstadoFilter("");
  };

  const handleEditRevestimiento = (revestimiento: IRevestimiento) => {
    setSelectedRevestimiento(revestimiento);
    setIsEditMode(true);
    setOpenCreateDialog(true);
  };

  const handleDeleteRevestimiento = async (id string) => {
    try {
      await deleteRevestimientoMutation.mutateAsync(id);
      fetchRevestimientos();
      setOpenPopUp(false);
    } catch (error) {
      console.error("Error eliminando al revestimiento:", id, error);
    }
  };

  const handleTextNoResults = () => {
    if (
      filterQuery.nombreCliente ||
      filterQuery.fechaCreacion ||
      filterQuery.tipoRevestimiento ||
      filterQuery.estado
    ) {
      return formatNoResultsText(
        "revestimiento",
        filterQuery.nombreCliente ||
          filterQuery.fechaCreacion ||
          filterQuery.tipoRevestimiento ||
          filterQuery.estado ||
          ""
      );
    }
  };

  const handleOpenDeletePopUp = (revestimiento: IRevestimiento) => {
    setSelectedRevestimiento(revestimiento);
    setOpenPopUp(true);
  };

  return (
    <div>
      <div className={style.filtersContainer}>
        <div className={style.filters}>
          <InputText
            title="Buscar por Cliente"
            placeholder="Nombre"
            onChange={(value: string) => {
              setNombreFilter(value);
              handleFilterName(value);
            }}
            value={nombreFilter}
          />
        </div>
        <div className={style.filters}>
          <CustomSelect
            label="Tipo de Revestimiento"
            options={tiposPiscinasMaterial}
            onChange={() => setTipoRevestimientoFilter}
            value={tipoRevestimientoFilter}
          />
        </div>
        <div className={style.filters}>
          <span className={style.labelField}>
            <CalendarMonthIcon />
            Fecha de Ingreso
          </span>
          <DatePickers
            value={fechaCreacionFilter ? dayjs(fechaCreacionFilter) : undefined}
            onChange={() => setFechaCreacionFilter}
          />
        </div>
        <div className={style.filters}>
          <CustomSelect
            label="Estado"
            options={tiposPiscinasMaterial}
            onChange={() => setEstadoFilter}
            value={estadoFilter}
          />
        </div>
        <div className={style.actionsFilters}>
          <Tooltip title="Limpiar Filtros" arrow leaveDelay={0}>
            <button onClick={handleClearFilter} className={style.actionButton}>
              <SearchOffIcon />
            </button>
          </Tooltip>
          <Tooltip title="Crear nuevo Revestimiento" arrow leaveDelay={0}>
            <button onClick={handleOpenCreateDialog}>
              <AddIcon />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className={style.tableContainer}>
        <TableGeneric
          titles={titlesTable}
          data={revestimientos}
          loading={isLoading}
          textNotFound={handleTextNoResults()}
          renderRow={(revestimiento) => {
            return (
              <tr key={revestimiento.id}>
                <td>{revestimiento.client.nombre}</td>
                <td>{revestimiento.fechaPropuesta}</td>
                <td>{revestimiento.tipoRevestimiento}</td>
                <td>{revestimiento.detalles}</td>
                <td>{formatMoneyNumber(revestimiento.valorTotal)}</td>
                <td>--</td>
                <td className="flex flex-col gap-2 sm:gap-4 items-center justify-center">
                  <Tooltip title="Ver detalles Cliente" arrow leaveDelay={0}>
                    <button
                      className="actions"
                      onClick={() => handleOpenDialog(revestimiento)}
                    >
                      <VisibilityIcon />
                    </button>
                  </Tooltip>
                  <Tooltip title="Editar Revestimiento" arrow leaveDelay={0}>
                    <button
                      onClick={() => handleEditRevestimiento(revestimiento)}
                    >
                      <EditIcon />
                    </button>
                  </Tooltip>
                  <Tooltip title="Eliminar Revestimiento" arrow leaveDelay={0}>
                    <button
                      onClick={() =>
                        revestimiento.id !== undefined &&
                        handleOpenDeletePopUp(revestimiento)
                      }
                    >
                      <DeleteIcon className={style.iconAction} />
                    </button>
                  </Tooltip>
                </td>
              </tr>
            );
          }}
        />
      </div>
      <InfoRevestimientoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        revestimientoInfo={revestimientoDetails ?? undefined}
      />
      <CreateRevestimientoDialog
        open={openCreateDialog}
        onClose={handleCloseDialog}
        isEditMode={isEditMode}
        revestimientoInfo={selectedRevestimiento ?? undefined}
      />
      <PopUp
        open={openPopUp}
        onClose={handleClosePopUp}
        onConfirm={() => {
          handleDeleteRevestimiento(selectedRevestimiento?.id?? "");
        }}
        title="Confirmar eliminación"
        confirmText="Eliminar"
      >
        <div className="flex flex-col gap-4 text-center">
          <p>¿Estás seguro de que deseas eliminar este revestimiento?</p>
          <p className="font-bold">
            {" "}
            Revestimiento de {selectedRevestimiento?.client.nombre}
          </p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
      </PopUp>
    </div>
  );
};

export default BodyRevestimiento;
