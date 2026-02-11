/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import type {
  IFilterVehiclesDto,
  IVehicle,
  IVehicleResponse,
} from "../../service/vehicle.interface";

import {
  FiltersContainer,
  type FilterItem,
} from "../common/FiltersContainer/FiltersContainer";
import type { FilterValue } from "../../service/employee.interface";
import TableGeneric from "../ui/table/Table";

import TrashIcon from "../ui/Icons/TrashIcon";
import AddIcon from "@mui/icons-material/Add";

import { titlesVehicles } from "../../constant/vehicles.constant";
import { useVehicleByPatente, useVehicles } from "../../hooks/VehiclesHooks";
import { useRefetchStore } from "../../store/refetchStore";
import VehicleDialog from "./VehicleDialog/VehicleDialog";
import { ActionsTdTable } from "../common/ActionsTable/ActionsTable";
import { formatDateToDDMMYYYY } from "../../utils/DateUtils";

const initial_filters: IFilterVehiclesDto = {
  placa: "",
  marca: "",
  modelo: "",
  anioDesde: undefined,
  anioHasta: undefined,
  color: "",
  isActive: undefined,
  orderBy: "placa",
  orderDirection: "ASC",
};

export const BodyVehicles = () => {
  const vehiclesMutation = useVehicles();
  const vehicleByPatenteMutation = useVehicleByPatente();
  const shouldRefetch = useRefetchStore((state) => state.shouldRefetch);

  const [filterQuery, setFilterQuery] =
    useState<IFilterVehiclesDto>(initial_filters);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [showVehiclesDialog, setShowVehiclesDialog] = useState(false);
  const [viewMode, setViewMode] = useState<
    "create" | "edit" | "view" | "delete"
  >("create");
  const [vehicleSelected, setVehicleSelected] =
    useState<IVehicleResponse | null>(null);

  const fetchVehiclesData = async () => {
    setLoadingTable(true);
    try {
      const vehicles = await vehiclesMutation.mutateAsync(filterQuery);
      console.log("Fetched vehicles:", vehicles);
      setVehicles(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchVehiclesData();
  }, [filterQuery, shouldRefetch]);

  const filters: FilterItem[] = [
    {
      title: "Placa",
      placeholder: "Ingrese placa",
      type: "text",
      value: filterQuery.placa || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, placa: value as string })),
    },
    {
      title: "Marca",
      placeholder: "Ingrese marca",
      type: "text",
      value: filterQuery.marca || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, marca: value as string })),
    },
    {
      title: "Modelo",
      placeholder: "Ingrese modelo",
      type: "text",
      value: filterQuery.modelo || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, modelo: value as string })),
    },
    // {
    //   title: "",
    //   placeholder: "Ingrese rango de años",
    //   type: "date",
    //   typeCalendar: "range",
    //   value: [
    //     filterQuery.anioDesde ? new Date(filterQuery.anioDesde, 0, 1) : null,
    //     filterQuery.anioHasta ? new Date(filterQuery.anioHasta, 0, 1) : null,
    //   ],
    //   onChange: (value: FilterValue) => {
    //     console.log(value);
    //     const dateRange = value as (Date | null)[];
    //     setFilterQuery((prev) => ({
    //       ...prev,
    //       anioDesde: dateRange[0] ? dateRange[0].getFullYear() : undefined,
    //       anioHasta: dateRange[1] ? dateRange[1].getFullYear() : undefined,
    //     }));
    //   },
    // },
    {
      title: "Color",
      placeholder: "Ingrese color",
      type: "text",
      value: filterQuery.color || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, color: value as string })),
    },

    {
      title: "Activo",
      placeholder: "Seleccione estado",
      type: "select",
      options: [
        { label: "Todos", value: "" },
        { label: "Activo", value: "true" },
        { label: "Inactivo", value: "false" },
      ],
      value:
        filterQuery.isActive === undefined
          ? ""
          : filterQuery.isActive
            ? "true"
            : "false",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({
          ...prev,
          isActive: value === "" ? undefined : value === "true",
        })),
    },
  ];

  const handleGetVehicleByPlaca = async (
    placa: string,
    viewMode: "create" | "edit" | "view" | "delete" = "view",
  ) => {
    console.log("Fetching vehicle with placa:", placa);
    try {
      setViewMode(viewMode);
      setLoadingTable(true);
      setShowVehiclesDialog(true);
      const vehicle = await vehicleByPatenteMutation.mutateAsync(placa);
      console.log("Fetched vehicle:", vehicle);
      setVehicleSelected(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle by ID:", error);
    } finally {
      setLoadingTable(false);
    }
  };

  const actionsButtons = [
    {
      titleTooltip: "Limpiar Filtros",
      icon: <TrashIcon />,
      onClick: () => setFilterQuery(initial_filters),
    },
    {
      titleTooltip: "Agregar Vehículo",
      icon: <AddIcon />,
      onClick: () => {
        setViewMode("create");
        setVehicleSelected(null);
        setShowVehiclesDialog(true);
      },
    },
  ];

  return (
    <div>
      <div>
        <FiltersContainer filters={filters} actionButtons={actionsButtons} />
      </div>
      <div>
        <TableGeneric
          titles={titlesVehicles}
          data={vehicles ?? []}
          loading={loadingTable}
          orderBy={filterQuery.orderBy}
          orderDirection={filterQuery.orderDirection}
          onOrderChange={(key, order) =>
            setFilterQuery((prev) => ({
              ...prev,
              orderBy: key,
              orderDirection: order,
            }))
          }
          renderRow={(vehicle) => (
            <tr>
              <td>{vehicle.placa}</td>
              <td>{vehicle.marca}</td>
              <td>{vehicle.modelo}</td>
              <td>{vehicle.anio}</td>
              <td>{vehicle.color}</td>
              <td>{formatDateToDDMMYYYY(vehicle.ultima_mantencion)}</td>
              <td>{vehicle.kilometraje}</td>
              <td>{vehicle.isActive ? "Activo" : "Inactivo"}</td>
              <td className="flex items-center">
                <ActionsTdTable
                  onView={() => handleGetVehicleByPlaca(String(vehicle.placa))}
                  onEdit={() =>
                    handleGetVehicleByPlaca(String(vehicle.placa), "edit")
                  }
                  onDelete={() =>
                    handleGetVehicleByPlaca(String(vehicle.placa), "delete")
                  }
                />
              </td>
            </tr>
          )}
        />
      </div>
      <VehicleDialog
        isOpen={showVehiclesDialog}
        onClose={() => setShowVehiclesDialog(false)}
        viewMode={viewMode}
        vehicleInfo={vehicleSelected || undefined}
      />
    </div>
  );
};
