import style from "./BodyUsers.module.css";
import { useEffect, useMemo, useState } from "react";
import { useDeleteUser, useUsers } from "../../hooks/UsersHooks";
import { type User } from "../../service/usuariosInterface";
import debounce from "lodash.debounce";
import InputText from "../ui/InputText/InputText";
import TableGeneric from "../ui/table/Table";
import { titlesTable } from "../../constant/constantBodyUsers";
import { Tooltip } from "@mui/material";
import TrashIcon from "../ui/Icons/TrashIcon";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface IfilterQuery {
  nombre?: string;
  role?: string;
  isActive?: boolean;
}

const BodyUsers = () => {
  const usersFilterMutation = useUsers();
  const usersDeleteMutation = useDeleteUser();

  const [users, setUsers] = useState<User[]>([]);
  const [filterQuery, setFilterQuery] = useState<IfilterQuery>({});
  const [loadingTable, setLoadingTable] = useState(false);

  const fetchData = async () => {
    setLoadingTable(true);
    try {
      const usersData = await usersFilterMutation.mutateAsync();
      setUsers(usersData);
      setLoadingTable(false);
    } catch (error) {
      console.log(error);
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterQuery]);

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

  const handleFilterIsActive = (value: boolean) => {
    setFilterQuery((prev) => ({ ...prev, isActive: value }));
  };

  const handleFilterRole = (value: string) => {
    setFilterQuery((prev) => ({ ...prev, role: value }));
  };

  const handleClearFilters = () => {
    setFilterQuery({});
  };

  const handleEditUser = (user: User) => {
    // Lógica para editar usuario
    console.log("Editar Usuario:", user);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersDeleteMutation.mutateAsync(userId);
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className={style.filtersContainer}>
        <InputText
          title="Buscar por Nombre"
          placeholder="Nombre"
          onChange={(value: string) => {
            handleFilterName(value);
          }}
          value={filterQuery.nombre || ""}
        />
        <div className={style.actionsFilters}>
          <Tooltip title="Limpiar Filtros" arrow leaveDelay={0}>
            <button onClick={handleClearFilters} className={style.actionButton}>
              <TrashIcon />
            </button>
          </Tooltip>
          <Tooltip title="Agregar nuevo Usuario" arrow leaveDelay={0}>
            <button>
              <AddIcon />
            </button>
          </Tooltip>
        </div>
      </div>
      <div>
        <TableGeneric
          titles={titlesTable}
          data={users}
          loading={loadingTable}
          renderRow={(user) => (
            <tr key={user.id}>
              <td>{user.user_name}</td>
              <td>{`${user.first_name} ${user.last_name}`}</td>
              <td>{user.email}</td>
              <td>{user.roleUser.role.nombre}</td>
              <td>{user.isActive ? "Activo" : "Inactivo"}</td>
              <td>{user.last_login}</td>
              <td className="flex flex-col gap-2 sm:gap-4 items-center justify-center">
                <Tooltip title="Ver detalles Usuario" arrow leaveDelay={0}>
                  <button className="actions">
                    <VisibilityIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Editar Usuario" arrow leaveDelay={0}>
                  <button onClick={() => handleEditUser(user)}>
                    <EditIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Eliminar Usuario" arrow leaveDelay={0}>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    <TrashIcon className={style.iconAction} />
                  </button>
                </Tooltip>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default BodyUsers;
