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

import type { SelectChangeEvent } from "@mui/material";
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
  const [mantenciones, setMantenciones] = useState<IMaintenance[]>();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [nombreInput, setNombreInput] = useState("");
  const [direccionInput, setDireccionInput] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

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
    console.log(client);
    setSelectedClient(client);
    setIsEditMode(true);
    setOpenCreateDialog(true);
  };

  const handleDeleteClient = async (id: number) => {
    try {
      const response = await deleteClientMutation.mutateAsync(id);
      console.log(response);
      fetchData();
    } catch (error) {
      console.error("Error eliminando al cliente:", id, error);
    }
  };

  return (
    <div>
      <div>
        <label>
          Aqui se mostrara toda la información sobre los clientes activos
        </label>
      </div>
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
          renderRow={(client) => (
            <tr key={client.id}>
              <td>{client.nombre}</td>
              <td>{client.direccion}</td>
              <td>{client.comuna}</td>
              <td>{client.telefono}</td>
              <td>{client.email ? client.email : "No tiene email asociado"}</td>
              <td>{client.dia_mantencion}</td>
              <td>{formatMoneyNumber(client.valor_mantencion)}</td>
              <td>
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
                      client.id !== undefined && handleDeleteClient(client.id)
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
      />
      <CreateClientDialog
        open={openCreateDialog}
        onClose={handleCloseDialog}
        isEditMode={isEditMode}
        clientInfo={selectedClient ?? undefined}
      />
    </div>
  );
};

export default BodyClients;
