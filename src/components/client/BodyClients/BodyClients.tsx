import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import {
  useClient,
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

import { Checkbox, type SelectChangeEvent } from "@mui/material";
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

interface IfilterQuery {
  nombre?: string;
  direccion?: string;
  dia?: string;
  comuna?: string;
}

const BodyClients = () => {
  const clientMutation = useClient();
  const maintenanceByClient = useMaintenancesByClient();
  const clientFilterMutation = useClientsByFilters();
  const deleteClientMutation = useDeleteClient();

  const [clients, setClients] = useState<Client[]>();
  const [filterQuery, setFilterQuery] = useState<IfilterQuery>({});
  const [loadingTable, setLoadingTable] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
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
    try {
      const clients = await clientMutation.mutateAsync();
      setClients(clients);
      setLoadingTable(false);
    } catch (error) {
      console.log("Error al cargar usuarios o clientes:", error);
      setLoadingTable(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const filtered = await clientFilterMutation.mutateAsync(filterQuery);
        setClients(filtered);
      } catch (error) {
        console.error("Error al filtrar clientes:", error);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [JSON.stringify(filterQuery)]);

  const handleFilterName = useMemo(
    () =>
      debounce((value: string) => {
        setFilterQuery((prev) => {
          if (value.length >= 3) {
            return { ...prev, nombre: value };
          } else if (value.length === 0) {
            // eliminar filtro nombre cuando está vacío
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
            // eliminar filtro direccion cuando está vacío
            const updated = { ...prev };
            delete updated.direccion;
            return updated;
          }
          return prev ?? {};
        });
      }, 500),
    []
  );

  const handleChangeComuna = (event: SelectChangeEvent) => {
    setSelectedComuna(event.target.value);
    setFilterQuery((prev) => ({ ...prev, comuna: event.target.value }));
  };

  const handleChangeDiaMantencion = (event: SelectChangeEvent) => {
    setSelectedDay(event.target.value);
    setFilterQuery((prev) => ({ ...prev, dia: event.target.value }));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenCreateDialog(false);
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
        nombreInput || direccionInput || selectedComuna || selectedDay,
        "clientes"
      );
    }
  };

  const handleOpenDeletePopUp = (client: Client) => {
    setSelectedClient(client);
    setOpenPopUp(true);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClients((prev) => [...prev, client]);
  };

  return (
    <div className="pt-4">
      <div className={style.filtersContainer}>
        <div className={style.filters}>
          <InputText
            title="Buscar por Nombre"
            placeholder="Nombre"
            onChange={handleFilterName}
            value={nombreInput}
          />
        </div>
        <div className={style.filters}>
          <InputText
            title="Buscar por dirección"
            placeholder="Dirección"
            onChange={handleFilterDireccion}
            value={direccionInput}
          />
        </div>
        <div className={`${style.filters} select`}>
          <Select
            label="Dia Mantención"
            options={dias}
            onChange={handleChangeDiaMantencion}
            value={selectedDay}
          />
        </div>
        <div className={style.filters}>
          <Select
            label="Comuna"
            options={comunas}
            onChange={handleChangeComuna}
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
      <div className={style.tableContainer}>
        <TableGeneric
          titles={titlesTable}
          data={clients ?? []}
          loading={loadingTable}
          textNotFound={handleTextNoResults()}
          renderRow={(client) => (
            <tr key={client.id}>
              <td>
                <Checkbox
                  checked={selectedClients.includes(client)}
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
              <td className="flex flex-col gap-2  sm:gap-4 items-center justify-center">
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
    </div>
  );
};

export default BodyClients;
