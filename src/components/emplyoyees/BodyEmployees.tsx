/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  FiltersContainer,
  type FilterItem,
} from "../common/FiltersContainer/FiltersContainer";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrashIcon from "../ui/Icons/TrashIcon";
import AddIcon from "@mui/icons-material/Add";
import TableGeneric from "../ui/table/Table";
import { grupos, titlesEmployees } from "../../constant/employees.contant";
import { useEmployee, useEmployeeById } from "../../hooks/EmployeeHooks";
import type {
  FiltersEmployeesDto,
  FilterValue,
  IEmployee,
} from "../../service/employee.interface";
import CreateEmployeeDialog from "./CreateEmployee/CreateEmployeeDialog";
import Tooltip from "@mui/material/Tooltip";
import PencilIcon from "../ui/Icons/PencilIcon";
import style from "./BodyEmployees.module.css";
import { useRefetchStore } from "../../store/refetchStore";

const initial_filters: FiltersEmployeesDto = {
  nombre: "",
  apellido: "",
  telefono: "",
  grupo: "",
  orderBy: "nombre",
  orderDirection: "ASC",
};

export const BodyEmployees = () => {
  const employeeMutation = useEmployee();
  const employeeIdMutation = useEmployeeById();
  const shouldRefetch = useRefetchStore((state) => state.shouldRefetch);

  const [filterQuery, setFilterQuery] =
    useState<FiltersEmployeesDto>(initial_filters);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [showCreateEmployeeDialog, setShowCreateEmployeeDialog] =
    useState(false);
  const [viewMode, setViewMode] = useState<
    "create" | "edit" | "view" | "delete"
  >("create");
  const [employeeSelected, setEmployeeSelected] = useState<IEmployee | null>(
    null,
  );

  const fetchEmployeesData = async () => {
    setLoadingTable(true);
    try {
      const employees = await employeeMutation.mutateAsync(filterQuery);
      setEmployees(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, [filterQuery, shouldRefetch]);

  const filters: FilterItem[] = [
    {
      title: "Nombre",
      placeholder: "Ingrese nombre",
      type: "text",
      value: filterQuery.nombre || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, nombre: value as string })),
    },
    {
      title: "Apellido",
      placeholder: "Ingrese apellido",
      type: "text",

      value: filterQuery.apellido || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, apellido: value as string })),
    },
    {
      title: "Teléfono",
      placeholder: "Ingrese teléfono",
      type: "text",
      value: filterQuery.telefono || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, telefono: value as string })),
    },
    {
      title: "Grupo",
      placeholder: "Ingrese grupo",
      type: "select",
      value: filterQuery.grupo || "",
      onChange: (value: FilterValue) =>
        setFilterQuery((prev) => ({ ...prev, grupo: value as string })),
      options: grupos,
    },
  ];

  // const hasFiltersApplied = Object.values(filterQuery)
  //   .map((value, index) => ({ key: Object.keys(filterQuery)[index], value }))
  //   .filter((item) => item.key !== "orderBy" && item.key !== "orderDirection")
  //   .some(
  //     (item) =>
  //       item.value !== "" && item.value !== null && item.value !== undefined,
  //   );

  const handleGetEmployeeById = async (
    id: string,
    viewMode: "create" | "edit" | "view" | "delete" = "view",
  ) => {
    console.log("Fetching employee with ID:", id);
    try {
      setViewMode(viewMode);
      setLoadingTable(true);
      setShowCreateEmployeeDialog(true);
      const employee = await employeeIdMutation.mutateAsync(id);
      setEmployeeSelected(employee);
    } catch (error) {
      console.error("Error fetching employee by ID:", error);
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
      titleTooltip: "Agregar Empleado",
      icon: <AddIcon />,
      onClick: () => {
        setViewMode("create");
        setEmployeeSelected(null);
        setShowCreateEmployeeDialog(true);
      },
    },
  ];

  return (
    <div>
      <FiltersContainer filters={filters} actionButtons={actionsButtons} />
      <div>
        <TableGeneric
          titles={titlesEmployees}
          data={employees ?? []}
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
          renderRow={(employee) => (
            <tr>
              <td>{employee.nombre}</td>
              <td>{employee.apellido}</td>
              <td>
                {employee.rut}-{employee.dv}
              </td>
              <td>{employee.telefono}</td>
              <td>{employee.direccion}</td>
              <td>{employee.grupo}</td>
              <td>{employee.tipoContrato}</td>
              <td>{employee.estado}</td>
              <td className="flex items-center">
                <Tooltip title="Ver detalles Empleado" arrow leaveDelay={0}>
                  <button
                    className="actions"
                    onClick={() => handleGetEmployeeById(String(employee.id))}
                  >
                    <VisibilityIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Editar Cliente" arrow leaveDelay={0}>
                  <button
                    onClick={() =>
                      handleGetEmployeeById(String(employee.id), "edit")
                    }
                  >
                    <PencilIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Eliminar Cliente" arrow leaveDelay={0}>
                  <button
                    onClick={() =>
                      handleGetEmployeeById(String(employee.id), "delete")
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
      <CreateEmployeeDialog
        isOpen={showCreateEmployeeDialog}
        onClose={() => setShowCreateEmployeeDialog(false)}
        employeeInfo={employeeSelected ?? undefined}
        viewMode={viewMode}
      />
    </div>
  );
};
