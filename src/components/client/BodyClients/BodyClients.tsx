/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import {
  useClientsByFilters,
  useDeleteClient,
} from "../../../hooks/ClientHooks";
import type { Client } from "../../../service/clientInterface";
import { useMaintenancesByClient } from "../../../hooks/MaintenanceHooks";
import { type IMaintenance } from "../../../service/maintenanceInterface";
import style from "./BodyClients.module.css";

import Select from "../../ui/Select/Select";
import InputText from "../../ui/InputText/InputText";
import TableGeneric from "../../ui/table/Table";
import InfoClientDialog from "../InfoClient/InfoDialogClient";
import CreateClientDialog from "../CreateClient/CreateClientDialog";

import { Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import {
  comunas,
  dias,
  titlesTable,
} from "../../../constant/constantBodyClient";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import { formatNoResultsText } from "../../../utils/FiltersUtils";
import PopUp from "../../ui/PopUp/PopUp";
import { CustomSnackBar } from "../../ui/snackBar/CustomSnackBar";
import { useSnackBarModalStore } from "../../../store/snackBarStore";
import { getWindowWidth } from "../../../utils/WindowUtils";
import CaretIcon from "../../ui/Icons/CaretIcon";

interface IfilterQuery {
  nombre?: string;
  direccion?: string;
  dia?: string;
  comuna?: string;
}

const BodyClients = () => {
  const maintenanceByClient = useMaintenancesByClient();
  const clientFilterMutation = useClientsByFilters();
  const deleteClientMutation = useDeleteClient();

  const { setSnackBar } = useSnackBarModalStore();
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());

  const [clients, setClients] = useState<Client[]>();
  const [filterQuery, setFilterQuery] = useState<IfilterQuery>({});
  const [loadingTable, setLoadingTable] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [currentClientIndex, setCurrentClientIndex] = useState(0);

  const [mantenciones, setMantenciones] = useState<IMaintenance[]>();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [nombreInput, setNombreInput] = useState("");
  const [direccionInput, setDireccionInput] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [openPopUp, setOpenPopUp] = useState(false);

  const handleClosePopUp = () => {
    setOpenPopUp(false);
  };

  const handleOpenDialog = async (client: Client) => {
    setSelectedClient(client);
    handleSeeDetailsClient(client);
    setOpenDialog(true);
  };
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const fetchData = async () => {
    setLoadingTable(true);
    const handler = setTimeout(async () => {
      try {
        const filtered = await clientFilterMutation.mutateAsync(filterQuery);
        setClients(filtered);
        setLoadingTable(false);
      } catch (error) {
        console.error("Error al filtrar clientes:", error);
      }
    }, 500);

    return () => clearTimeout(handler);
  };

  useEffect(() => {
    fetchData();
  }, [filterQuery]);

  useEffect(() => {
    if (selectedClients.length > 0) {
      setSnackBar(
        true,
        `Ver detalles de ${selectedClients.length} cliente(s).`
      );
    } else {
      setSnackBar(false, "");
    }
  }, [selectedClients, setSnackBar]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleFilterName = useMemo(
    () =>
      debounce((value: string) => {
        setFilterQuery((prev) => {
          if (value.length >= 3) {
            return { ...prev, nombre: value };
          } else if (value.length === 0) {
            const updated = { ...prev };
            delete updated.nombre;
            return updated;
          }
          return prev ?? {};
        });
      }, 500),
    []
  );

  const handleFilterDireccion = useMemo(
    () =>
      debounce((value: string) => {
        setFilterQuery((prev) => {
          if (value.length >= 3) {
            return { ...prev, direccion: value };
          } else if (value.length === 0) {
            const updated = { ...prev };
            delete updated.direccion;
            return updated;
          }
          return prev ?? {};
        });
      }, 500),
    []
  );

  const handleChangeComuna = (value: string) => {
    setSelectedComuna(value);
    setFilterQuery((prev) => ({ ...prev, comuna: value }));
  };

  const handleChangeDiaMantencion = (value: string) => {
    setSelectedDay(value);
    setFilterQuery((prev) => ({ ...prev, dia: value }));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenCreateDialog(false);
    if (selectedClients.length > 0) {
      setSnackBar(
        true,
        `Ver detalles de ${selectedClients.length} cliente(s).`
      );
    }
  };

  const handleSeeDetailsClient = async (client: Client) => {
    setSelectedClient(client);
    try {
      if (!client.id) return;
      const mantenciones = await maintenanceByClient.mutateAsync(client.id);
      setMantenciones(mantenciones);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error cargando mantenciones:", error);
    }
  };

  const handleClearFilter = () => {
    setFilterQuery({});
    setNombreInput("");
    setDireccionInput("");
    setSelectedComuna("");
    setSelectedDay("");
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditMode(true);
    setOpenCreateDialog(true);
  };

  const handleDeleteClient = async (id: number) => {
    try {
      await deleteClientMutation.mutateAsync(id);
      fetchData();
      setOpenPopUp(false);
    } catch (error) {
      console.error("Error eliminando al cliente:", id, error);
    }
  };

  const handleTextNoResults = () => {
    if (
      filterQuery.nombre ||
      filterQuery.direccion ||
      filterQuery.comuna ||
      filterQuery.dia
    ) {
      return formatNoResultsText(
        "clients",
        filterQuery.nombre ||
          filterQuery.direccion ||
          filterQuery.comuna ||
          filterQuery.dia ||
          ""
      );
    }
  };

  const handleOpenDeletePopUp = (client: Client) => {
    setSelectedClient(client);
    setOpenPopUp(true);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClients((prev) => {
      const alreadySelected = prev.some((c) => c.id === client.id);
      if (alreadySelected) {
        return prev.filter((c) => c.id !== client.id);
      } else {
        return [...prev, client];
      }
    });
  };

  const handleSeeMultiSelectClients = async (index: number) => {
    if (selectedClients.length === 0) return;
    try {
      const client = selectedClients[index];
      console.log("Cliente seleccionado para ver detalles:", client);
      if (!client.id) return;
      const mantenciones = await maintenanceByClient.mutateAsync(client.id);
      setMantenciones(mantenciones);
      setSelectedClient(client);
      setCurrentClientIndex(index);
      setOpenDialog(true);
      setSnackBar(false, "");
    } catch (error) {
      console.error("Error cargando mantenciones:", error);
    }
  };

  const handleNextClient = async () => {
    const nextIndex = currentClientIndex + 1;
    if (nextIndex < selectedClients.length) {
      await handleSeeMultiSelectClients(nextIndex);
    }
  };

  const handlePreviousClient = async () => {
    const prevIndex = currentClientIndex - 1;
    if (prevIndex >= 0) {
      await handleSeeMultiSelectClients(prevIndex);
    }
  };

  return (
    <div className="pt-4 ">
      <div className={style.filtersContainer}>
        <div className={style.filters}>
          <InputText
            title="Buscar por Nombre"
            placeholder="Nombre"
            onChange={(value: string) => {
              setNombreInput(value);
              handleFilterName(value);
            }}
            value={nombreInput}
          />
        </div>
        <div className={style.filters}>
          <InputText
            title="Buscar por dirección"
            placeholder="Dirección"
            onChange={(value: string) => {
              setDireccionInput(value);
              handleFilterDireccion(value);
            }}
            value={direccionInput}
          />
        </div>
        <div className={`${style.filters} select`}>
          <Select
            label="Dia Mantención"
            options={dias}
            onChange={(event) =>
              handleChangeDiaMantencion(String(event.target.value))
            }
            value={selectedDay}
          />
        </div>
        <div className={style.filters}>
          <Select
            label="Comuna"
            options={comunas}
            onChange={(event) => handleChangeComuna(String(event.target.value))}
            value={selectedComuna}
          />
        </div>
        <div className={style.actionsFilters}>
          <Tooltip title="Limpiar Filtros" arrow leaveDelay={0}>
            <button onClick={handleClearFilter} className={style.actionButton}>
              <SearchOffIcon />
            </button>
          </Tooltip>
          <Tooltip title="Agregar nuevo Cliente" arrow leaveDelay={0}>
            <button onClick={handleOpenCreateDialog}>
              <AddIcon />
            </button>
          </Tooltip>
        </div>
      </div>
      {windowWidth < 600 && selectedClients.length > 0 && (
        <div className="flex flex-row w-full items-center justify-center pt-4">
          <button
            onClick={() => handleSeeMultiSelectClients(currentClientIndex)}
            className={style.addButton}
          >
            Ver detalles de {selectedClients.length} cliente(s).
          </button>
        </div>
      )}
      <div className={style.tableContainer}>
        <TableGeneric
          titles={titlesTable}
          data={clients ?? []}
          loading={loadingTable}
          textNotFound={handleTextNoResults()}
          renderHeader={(title, index) => {
            if (index === 0) {
              const allSelected =
                clients &&
                clients.length > 0 &&
                selectedClients.length === clients.length;
              const someSelected =
                selectedClients.length > 0 &&
                selectedClients.length < (clients?.length ?? 0);

              return (
                <th key={index}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => {
                      if (e.target.checked && clients) {
                        setSelectedClients(clients);
                      } else {
                        setSelectedClients([]);
                      }
                    }}
                  />
                </th>
              );
            }
            return (
              <th key={index}>
                <span className="flex flex-row items-center gap-2">
                  {title.label}
                  {title.showOrderBy && <CaretIcon color="#0289c7" />}
                </span>
              </th>
            );
          }}
          renderRow={(client) => (
            <tr key={client.id}>
              <td>
                <Checkbox
                  checked={selectedClients.some((c) => c.id === client.id)}
                  onChange={() => handleSelectClient(client)}
                />
              </td>
              <td>{client.nombre}</td>
              <td>{client.direccion}</td>
              <td>{client.comuna}</td>
              <td>{client.telefono}</td>
              <td>{client.email ? client.email : "No tiene email asociado"}</td>
              <td>{client.dia_mantencion}</td>
              <td>{formatMoneyNumber(client.valor_mantencion)}</td>
              <td className="flex flex-col gap-2 sm:gap-4 items-center justify-center">
                <Tooltip title="Ver detalles Cliente" arrow leaveDelay={0}>
                  <button
                    className="actions"
                    onClick={() => handleOpenDialog(client)}
                  >
                    <VisibilityIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Editar Cliente" arrow leaveDelay={0}>
                  <button onClick={() => handleEditClient(client)}>
                    <EditIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Eliminar Cliente" arrow leaveDelay={0}>
                  <button
                    onClick={() =>
                      client.id !== undefined && handleOpenDeletePopUp(client)
                    }
                  >
                    <DeleteIcon className={style.iconAction} />
                  </button>
                </Tooltip>
              </td>
            </tr>
          )}
        />
      </div>
      <InfoClientDialog
        open={openDialog}
        onClose={handleCloseDialog}
        clientInfo={selectedClient ?? undefined}
        maintenancesClient={mantenciones ?? undefined}
        onMaintenanceCreated={async () => {
          if (selectedClient?.id) {
            const updatedMaintenances = await maintenanceByClient.mutateAsync(
              selectedClient.id
            );
            setMantenciones(updatedMaintenances);
          }
        }}
        onNextClient={handleNextClient}
        onPreviousClient={handlePreviousClient}
        totalRecords={selectedClients.length}
        currentIndex={currentClientIndex}
      />
      <CreateClientDialog
        open={openCreateDialog}
        onClose={handleCloseDialog}
        isEditMode={isEditMode}
        clientInfo={selectedClient ?? undefined}
      />
      <PopUp
        open={openPopUp}
        onClose={handleClosePopUp}
        onConfirm={() => {
          handleDeleteClient(selectedClient?.id ?? 0);
        }}
        title="Confirmar eliminación"
        confirmText="Eliminar"
      >
        <div className="flex flex-col gap-4 text-center">
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
          <p className="font-bold">{selectedClient?.nombre}</p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
      </PopUp>
      <CustomSnackBar
        onClick={() => handleSeeMultiSelectClients(currentClientIndex)}
      />
    </div>
  );
};

export default BodyClients;
