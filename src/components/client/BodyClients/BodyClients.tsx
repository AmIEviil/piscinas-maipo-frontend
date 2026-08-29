/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import {
  useClientsByFilters,
  useClientsById,
  useDeleteClient,
  useFrecuenciasMantencion,
} from "../../../hooks/ClientHooks";
import type { Client, IClientForm } from "../../../service/client.interface";
import { useMaintenancesByClient } from "../../../hooks/MaintenanceHooks";
import { type IMaintenance } from "../../../service/maintenance.interface";
import style from "./BodyClients.module.css";

import InfoClientDialog from "../InfoClient/InfoDialogClient";
import CreateClientDialog from "../CreateClient/CreateClientDialog";

import { Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
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
import {
  FiltersContainer,
  type FilterItem,
} from "../../common/FiltersContainer/FiltersContainer";
import AdvancedFiltersSheet from "../../common/FiltersContainer/AdvancedFiltersSheet";
import type { FilterValue } from "../../../service/employee.interface";
import { BREAKPOINTS } from "../../../constant/breakpoints";

interface IfilterQuery {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  dia?: string;
  comuna?: string;
  ruta?: string;
  /** Id de la periodicidad de visitas, no su nombre. */
  frecuencia?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

const initial_filters: IfilterQuery = {
  nombre: "",
  direccion: "",
  telefono: "",
  dia: "",
  comuna: "",
  ruta: "",
  frecuencia: "",
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
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
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
  const [comprobantes, setComprobantes] =
    useState<Record<string, IComprobantePago[]>>();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);

  const selectedDayHome = useBoundStore((state) => state.dayFilter);
  const setDayFilterStore = useBoundStore((state) => state.setDayFilter);
  const selectAllOnLoad = useBoundStore((state) => state.selectAllOnLoad);
  const setSelectAllOnLoad = useBoundStore((state) => state.setSelectAllOnLoad);

  const [openPopUp, setOpenPopUp] = useState(false);
  const [openBusquedaAvanzada, setOpenBusquedaAvanzada] = useState(false);

  const { data: frecuencias = [] } = useFrecuenciasMantencion();

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
    if (shouldRefetch) {
      if (openDialog && selectedClient) {
        handleSeeDetailsClient(selectedClient);
      }
      setShouldRefetch(false);
    }
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

  // El Home puede pedir llegar con todo seleccionado para empezar a registrar
  // mantenciones de inmediato. Hay que esperar a que termine el fetch: antes de
  // eso `clients` todavia trae el resultado del filtro anterior (o nada).
  useEffect(() => {
    if (!selectAllOnLoad || loadingTable || clients === undefined) return;
    const todosLosClientes = Object.values(clients).flat();
    if (todosLosClientes.length > 0) {
      setSelectedClients(todosLosClientes);
    }
    setSelectAllOnLoad(false);
  }, [selectAllOnLoad, loadingTable, clients, setSelectAllOnLoad]);

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

  const handleFilterTelefono = useMemo(
    () =>
      debounce((value: string) => {
        setFilterQuery((prev) => {
          if (value.length >= 3) {
            return { ...prev, telefono: value };
          } else if (value.length === 0) {
            const updated = { ...prev };
            delete updated.telefono;
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

  const handleChangeFrecuencia = (value: string) => {
    setFilterQuery((prev) => ({ ...prev, frecuencia: value }));
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
    setFilterQuery(initial_filters);
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
    console.log("Seleccionando todos en grupo:", key, clientsInGroup);
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
    setLoadingClientInfo(true);
    if (selectedClients.length === 0) return;
    try {
      const client = selectedClients[index];
      if (!client.id) return;
      const clientInfo = await clientByIdMutation.mutateAsync(client.id);
      setClientInfo(clientInfo);
      const mantenciones = await maintenanceByClient.mutateAsync(client.id);
      setMantenciones(mantenciones);
      const comprobantes = await comprobantesByClient.mutateAsync(client.id);
      setComprobantes(comprobantes);
      setSelectedClient(client);
      setCurrentClientIndex(index);
      setOpenDialog(true);
      setSnackBar(false, "");
      setLoadingClientInfo(false);
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

  /**
   * Catalogo unico de filtros.
   *
   * Se declara una sola vez y despues se reparte: la barra muestra un
   * subconjunto y la hoja de busqueda avanzada los muestra todos, agrupados.
   * Antes eran dos listas paralelas, y cualquier filtro nuevo habia que
   * acordarse de agregarlo en ambas.
   */
  const filtroNombre: FilterItem = {
    title: "Nombre",
    placeholder: "Nombre del cliente",
    type: "text",
    value: filterQuery.nombre || "",
    onChange: (value: FilterValue) => {
      handleFilterName(String(value));
    },
  };

  const filtroTelefono: FilterItem = {
    title: "Teléfono",
    placeholder: "Teléfono",
    type: "text",
    value: filterQuery.telefono || "",
    onChange: (value: FilterValue) => {
      handleFilterTelefono(String(value));
    },
  };

  const filtroDireccion: FilterItem = {
    title: "Dirección",
    placeholder: "Dirección",
    type: "text",
    value: filterQuery.direccion || "",
    onChange: (value: FilterValue) => {
      handleFilterDireccion(String(value));
    },
  };

  const filtroComuna: FilterItem = {
    title: "Comuna",
    placeholder: "Todas las comunas",
    type: "select",
    options: comunas,
    value: filterQuery.comuna || "",
    onChange: (value: FilterValue) => {
      handleChangeComuna(String(value));
    },
  };

  const filtroDia: FilterItem = {
    title: "Día de mantención",
    placeholder: "Todos los días",
    type: "select",
    options: dias,
    value: filterQuery.dia || "",
    onChange: (value: FilterValue) => {
      handleChangeDiaMantencion(String(value));
    },
  };

  const filtroFrecuencia: FilterItem = {
    title: "Periodicidad",
    placeholder: "Todas",
    type: "select",
    // El valor que viaja al API es el id de la frecuencia; la opcion vacia es
    // la que permite volver a "todas".
    options: [
      { label: "Todas", value: "" },
      ...frecuencias.map((frecuencia) => ({
        label: frecuencia.nombre,
        value: frecuencia.id,
      })),
    ],
    value: filterQuery.frecuencia || "",
    onChange: (value: FilterValue) => {
      handleChangeFrecuencia(String(value));
    },
  };

  const filtroRuta: FilterItem = {
    title: "Ruta",
    placeholder: "Todas las rutas",
    type: "select",
    options: rutas,
    value: filterQuery.ruta || "",
    onChange: (value: FilterValue) => {
      handleChangeRuta(String(value));
    },
  };

  const filtroActivo: FilterItem[] = isSuperAdmin
    ? [
        {
          title: "Estado",
          placeholder: "Activo",
          type: "select",
          options: [
            { label: "Activos", value: "true" },
            { label: "Inactivos", value: "false" },
          ],
          value: filterQuery.isActive?.toString() || "",
          onChange: (value: FilterValue) => {
            handleChangeActive(value === "true");
          },
        },
      ]
    : [];

  /**
   * Filtros de la barra: los tres que se usan para armar la ruta del dia.
   *
   * El resto vive en la hoja de busqueda avanzada. Con los ocho a la vista la
   * barra ocupaba dos filas completas antes de que apareciera un solo cliente.
   */
  const filtrosBasicos: FilterItem[] = [filtroNombre, filtroDia, filtroRuta];

  const gruposAvanzados = [
    { titulo: "Identificación", filtros: [filtroNombre, filtroTelefono] },
    { titulo: "Ubicación", filtros: [filtroDireccion, filtroComuna] },
    { titulo: "Servicio", filtros: [filtroDia, filtroFrecuencia] },
    { titulo: "Ruta y estado", filtros: [filtroRuta, ...filtroActivo] },
  ];

  // Se cuentan los filtros que la barra no muestra: el badge existe para
  // avisar de lo que esta aplicado y no se ve. isActive se cuenta solo cuando
  // vale false, porque la vista arranca en "activos" y contarlo dejaria el
  // badge en 1 desde el primer render.
  const filtrosAvanzadosActivos = [
    filterQuery.telefono,
    filterQuery.direccion,
    filterQuery.comuna,
    filterQuery.frecuencia,
    filterQuery.isActive === false ? "inactivos" : "",
  ].filter(Boolean).length;

  // Dos contadores distintos a proposito. El badge del boton solo cuenta lo
  // que esta aplicado y NO se ve en la barra, que es de lo que avisa. El
  // subtitulo y el "Limpiar" de la hoja cuentan todo, porque la hoja muestra
  // todos los filtros y limpiar solo la mitad de lo que se ve seria mentira.
  const totalFiltrosActivos =
    filtrosAvanzadosActivos +
    [filterQuery.nombre, filterQuery.dia, filterQuery.ruta].filter(Boolean)
      .length;

  const hasFilters = Boolean(
    filterQuery.nombre ||
      filterQuery.telefono ||
      filterQuery.direccion ||
      filterQuery.comuna ||
      filterQuery.dia ||
      filterQuery.ruta ||
      filterQuery.frecuencia,
  );

  const actionsButtons = [
    {
      titleTooltip: "Limpiar Filtros",
      icon: <TrashIcon />,
      disabled: !hasFilters,
      onClick: () => handleClearFilter(),
    },
    {
      titleTooltip: "Agregar nuevo Cliente",
      icon: <AddIcon />,
      onClick: () => {
        handleOpenCreateDialog();
      },
    },
  ];

  return (
    <div className="pt-4 ">
      <div className={style.filtersWrapper}>
        <FiltersContainer
          filters={filtrosBasicos}
          actionButtons={actionsButtons}
          extraControls={
            <button
              type="button"
              className={style.advancedButton}
              onClick={() => setOpenBusquedaAvanzada(true)}
              aria-haspopup="dialog"
              aria-expanded={openBusquedaAvanzada}
            >
              <TuneIcon fontSize="small" />
              Búsqueda avanzada
              {/* El contador es la unica senal de que hay filtros ocultos
                  activos: sin el, una busqueda vacia por un filtro guardado en
                  la hoja se lee como "no hay clientes". */}
              {filtrosAvanzadosActivos > 0 && (
                <span className={style.advancedBadge}>
                  {filtrosAvanzadosActivos}
                </span>
              )}
            </button>
          }
        />
      </div>
      <AdvancedFiltersSheet
        abierta={openBusquedaAvanzada}
        grupos={gruposAvanzados}
        activos={totalFiltrosActivos}
        onCerrar={() => setOpenBusquedaAvanzada(false)}
        onLimpiar={handleClearFilter}
      />
      {windowWidth < BREAKPOINTS.tablet && selectedClients.length > 0 && (
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
              <td>{client.frecuencia_mantencion?.nombre ?? "—"}</td>
              <td>{client.ruta}</td>
              <td>{formatMoneyNumber(client.valor_mantencion)}</td>
              <td className="flex flex-row flex-wrap gap-2 items-center justify-center">
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
        onClientUpdated={async () => {
          if (selectedClient) {
            await handleSeeDetailsClient(selectedClient);
          }
        }}
        onMaintenanceCreated={async () => {
          if (selectedClient?.id) {
            const updatedMaintenances = await maintenanceByClient.mutateAsync(
              selectedClient.id,
            );
            setMantenciones(updatedMaintenances);
          }
        }}
        onComprobanteChanged={async () => {
          if (selectedClient?.id) {
            const updatedComprobantes = await comprobantesByClient.mutateAsync(
              selectedClient.id,
            );
            setComprobantes(updatedComprobantes);
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
