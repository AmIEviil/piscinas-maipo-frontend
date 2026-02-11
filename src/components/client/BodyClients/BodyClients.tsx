/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import {
  useClientsByFilters,
  useClientsById,
  useDeleteClient,
} from "../../../hooks/ClientHooks";
import type { Client, IClientForm } from "../../../service/client.interface";
import { useMaintenancesByClient } from "../../../hooks/MaintenanceHooks";
import { type IMaintenance } from "../../../service/maintenance.interface";
import style from "./BodyClients.module.css";

import Select from "../../ui/Select/Select";
import InputText from "../../ui/InputText/InputText";
import InfoClientDialog from "../InfoClient/InfoDialogClient";
import CreateClientDialog from "../CreateClient/CreateClientDialog";

import { Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";

import {
  comunas,
  dias,
  rutas,
  titlesTable,
} from "../../../constant/constantBodyClient";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import { CustomSnackBar } from "../../ui/snackBar/CustomSnackBar";
import { useSnackBarModalStore } from "../../../store/snackBarStore";
import { getWindowWidth } from "../../../utils/WindowUtils";
import TrashIcon from "../../ui/Icons/TrashIcon";
import { useBoundStore } from "../../../store/BoundedStore";
import CollapsableTable from "../../ui/collapsable-table/CollapsableTable";
import { formatNoResultsText } from "../../../utils/FiltersUtils";
import { useRefetchStore } from "../../../store/refetchStore";
import CustomModal from "../../ui/modal/CustomModal";
import { usePermits } from "../../../utils/roleUtils";
import { useGetComprobantesByParentId } from "../../../hooks/ComprobantePagosHooks";
import type { IComprobantePago } from "../../../service/ComprobantePagos.interface";

interface IfilterQuery {
  nombre?: string;
  direccion?: string;
  dia?: string;
  comuna?: string;
  ruta?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

const initial_filters: IfilterQuery = {
  nombre: "",
  direccion: "",
  dia: "",
  comuna: "",
  ruta: "",
  isActive: true,
  orderBy: "nombre",
  orderDirection: "ASC",
};

const BodyClients = () => {
  const { isSuperAdmin } = usePermits();
  const clientByIdMutation = useClientsById();
  const maintenanceByClient = useMaintenancesByClient();
  const comprobantesByClient = useGetComprobantesByParentId();
  const clientFilterMutation = useClientsByFilters();
  const deleteClientMutation = useDeleteClient();

  const { setSnackBar } = useSnackBarModalStore();
  const shouldRefetch = useRefetchStore((state) => state.shouldRefetch);
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());

  const [clients, setClients] = useState<Record<string, Client[]>>();
  const [filterQuery, setFilterQuery] = useState<IfilterQuery>(initial_filters);
  const [loadingTable, setLoadingTable] = useState(false);
  const [clientInfo, setClientInfo] = useState<IClientForm | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [currentClientIndex, setCurrentClientIndex] = useState(0);

  const [mantenciones, setMantenciones] =
    useState<Record<string, IMaintenance[]>>();
  const [comprobantes, setComprobantes] = useState<IComprobantePago[]>();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);

  const selectedDayHome = useBoundStore((state) => state.dayFilter);
  const setDayFilterStore = useBoundStore((state) => state.setDayFilter);

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
    setSelectedClient(null);
    setIsEditMode(false);
    setCurrentClientIndex(0);
    setMantenciones(undefined);
    setSnackBar(false, "");
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
  }, [filterQuery, shouldRefetch]);

  useEffect(() => {
    if (selectedClients.length > 0) {
      setSnackBar(
        true,
        `Ver detalles de ${selectedClients.length} cliente(s).`,
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

  useEffect(() => {
    if (selectedDayHome) {
      setFilterQuery((prev) => ({ ...prev, dia: selectedDayHome }));
    }
  }, [selectedDayHome]);

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
    [],
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
    [],
  );

  const handleChangeComuna = (value: string) => {
    setFilterQuery((prev) => ({ ...prev, comuna: value }));
  };

  const handleChangeDiaMantencion = (value: string) => {
    setFilterQuery((prev) => ({ ...prev, dia: value }));
  };

  const handleChangeRuta = (value: string) => {
    setFilterQuery((prev) => ({ ...prev, ruta: value }));
  };

  const handleChangeActive = (value: boolean) => {
    setFilterQuery((prev) => ({ ...prev, isActive: value }));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenCreateDialog(false);
    if (selectedClients.length > 0) {
      setSnackBar(
        true,
        `Ver detalles de ${selectedClients.length} cliente(s).`,
      );
      setCurrentClientIndex(0);
    }
  };

  const handleSeeDetailsClient = async (client: Client) => {
    setLoadingClientInfo(true);
    setSelectedClient(client);
    try {
      if (!client.id) return;
      const clientInfo = await clientByIdMutation.mutateAsync(client.id);
      setClientInfo(clientInfo);
      setOpenDialog(true);
      const mantenciones = await maintenanceByClient.mutateAsync(client.id);
      setMantenciones(mantenciones);
      const comprobantes = await comprobantesByClient.mutateAsync(client.id);
      setComprobantes(comprobantes);
      setLoadingClientInfo(false);
    } catch (error) {
      console.error("Error cargando mantenciones:", error);
      setLoadingClientInfo(false);
    }
  };

  const handleClearFilter = () => {
    setFilterQuery({});
    setDayFilterStore("");
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditMode(true);
    setOpenCreateDialog(true);
  };

  const handleDeleteClient = async (id: string) => {
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
          "",
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

  const handleSelectAllInGroup = (key: string, clientsInGroup: Client[]) => {
    console.log("Selecting all in group:", key, clientsInGroup);
    setSelectedClients((prev) => {
      const allSelected = clientsInGroup.every((client) =>
        prev.some((c) => c.id === client.id),
      );
      if (allSelected) {
        // Remove all clients in the group from the selection
        return prev.filter(
          (client) => !clientsInGroup.some((c) => c.id === client.id),
        );
      } else {
        // Add all clients in the group to the selection
        const newSelections = clientsInGroup.filter(
          (client) => !prev.some((c) => c.id === client.id),
        );
        return [...prev, ...newSelections];
      }
    });
  };

  const handleSeeMultiSelectClients = async (index: number) => {
    if (selectedClients.length === 0) return;
    try {
      const client = selectedClients[index];
      if (!client.id) return;
      const clientInfo = await clientByIdMutation.mutateAsync(client.id);
      setClientInfo(clientInfo);
      const mantenciones = await maintenanceByClient.mutateAsync(client.id);
      setMantenciones(mantenciones);
      setSelectedClient(client);
      setCurrentClientIndex(index);
      setOpenDialog(true);
      setSnackBar(false, "");
    } catch (error) {
      setSnackBar(true, "Error cargando mantenciones");
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

  const hasFilters =
    filterQuery.nombre ||
    filterQuery.direccion ||
    filterQuery.comuna ||
    filterQuery.dia ||
    filterQuery.ruta;

  return (
    <div className="pt-4 ">
      <div className={style.filtersContainer}>
        <div className={style.filters}>
          <InputText
            title="Buscar por Nombre"
            placeholder="Nombre"
            onChange={(value: string) => {
              handleFilterName(value);
            }}
            value={filterQuery.nombre}
          />
        </div>
        <div className={style.filters}>
          <InputText
            title="Buscar por dirección"
            placeholder="Dirección"
            onChange={(value: string) => {
              handleFilterDireccion(value);
            }}
            value={filterQuery.direccion}
          />
        </div>
        <div className={style.filters}>
          <Select
            label="Comuna"
            options={comunas}
            onChange={(event) => handleChangeComuna(String(event.target.value))}
            value={filterQuery.comuna}
          />
        </div>
        <div className={`${style.filters}`}>
          <Select
            label="Dia Mantención"
            options={dias}
            onChange={(event) =>
              handleChangeDiaMantencion(String(event.target.value))
            }
            value={filterQuery.dia}
          />
        </div>
        <div className={`${style.filters}`}>
          <Select
            label="Ruta"
            options={rutas}
            onChange={(event) => handleChangeRuta(String(event.target.value))}
            value={filterQuery.ruta}
          />
        </div>
        {isSuperAdmin && (
          <div className={`${style.filters}`}>
            <Select
              label="Activo"
              options={[
                {
                  label: "Sí",
                  value: "true",
                },
                {
                  label: "No",
                  value: "false",
                },
              ]}
              onChange={(event) =>
                handleChangeActive(Boolean(event.target.value))
              }
              value={filterQuery.isActive?.toString()}
            />
          </div>
        )}
        <div className={style.actionsFilters}>
          {hasFilters && (
            <Tooltip title="Limpiar Filtros" arrow leaveDelay={0}>
              <button
                onClick={handleClearFilter}
                className={style.actionButton}
              >
                <TrashIcon />
              </button>
            </Tooltip>
          )}
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
        <CollapsableTable
          titlesTable={titlesTable}
          showCheckBoxes
          data={clients ?? {}}
          emptyMessage={handleTextNoResults()}
          loading={loadingTable}
          selectedItems={selectedClients}
          onSelectAllInGroup={handleSelectAllInGroup}
          orderBy={filterQuery.orderBy}
          orderDirection={filterQuery.orderDirection}
          onOrderChange={(key, direction) => {
            setFilterQuery({
              ...filterQuery,
              orderBy: key,
              orderDirection: direction,
            });
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
              <td>{client.ruta}</td>
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
                    <TrashIcon className={style.iconAction} />
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
        // @ts-ignore
        clientInfo={clientInfo ?? undefined}
        maintenancesClient={mantenciones ?? undefined}
        comprobantesClient={comprobantes ?? undefined}
        loading={loadingClientInfo}
        onMaintenanceCreated={async () => {
          if (selectedClient?.id) {
            const updatedMaintenances = await maintenanceByClient.mutateAsync(
              selectedClient.id,
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
      <CustomModal
        open={openPopUp}
        onClose={handleClosePopUp}
        onConfirm={() => {
          handleDeleteClient(selectedClient?.id ?? "");
        }}
        title="Confirmar eliminación"
        confirmLabel="Eliminar"
        content={
          <div className="flex flex-col gap-4 text-center">
            <p>¿Estás seguro de que deseas eliminar este cliente?</p>
            <p className="font-bold">{selectedClient?.nombre}</p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
        }
      />
      <CustomSnackBar
        onClick={() => handleSeeMultiSelectClients(currentClientIndex)}
      />
    </div>
  );
};

export default BodyClients;
