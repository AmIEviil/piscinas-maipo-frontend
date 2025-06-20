import { useEffect, useState } from "react";
import { useClient } from "../../../hooks/ClientHooks";
import type { Client } from "../../../service/clientInterface";
import style from "./BodyClients.module.css";

const BodyClients = () => {
  const clientMutation = useClient();

  const [clients, setClients] = useState<Client[]>();

  const titlesTable = [
    { label: "Nombre", showOrderBy: true },
    { label: "Dirección", showOrderBy: true },
    { label: "Comuna", showOrderBy: true },
    { label: "Telefono", showOrderBy: true },
    { label: "Email", showOrderBy: true },
    { label: "Dia de Mantención", showOrderBy: true },
    { label: "Valor Mantención", showOrderBy: true },
    { label: "Acciones", showOrderBy: true },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clients = await clientMutation.mutateAsync();
        setClients(clients);
      } catch (error) {
        console.log("Error al cargar usuarios o clientes:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className={style.filtersContainer}>
        <div>
          <p>Filtrar por Nombre</p>
          <input type="text" />
        </div>
        <div>
          <p>Filtrar por Dia</p>
          <select name="select">
            <option value="value1">Value 1</option>
            <option value="value2">Value 2</option>
            <option value="value3">Value 3</option>
          </select>
        </div>
        <div>
          <p>Filtrar por Comuna</p>
          <select name="select">
            <option value="value1">Value 1</option>
            <option value="value2">Value 2</option>
            <option value="value3">Value 3</option>
          </select>
        </div>
      </div>
      <div className={style.tableContainer}>
        <table>
          <thead>
            {titlesTable.map((title) => (
              <th>{title.label}</th>
            ))}
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id}>
                <td>{client.nombre}</td>
                <td>{client.direccion}</td>
                <td>{client.comuna}</td>
                <td>{client.telefono}</td>
                <td>{client.email}</td>
                <td>{client.diaMantencion}</td>
                <td>{client.valorMantencion}</td>
                <td>
                  <button>Ver</button>
                  <button>Editar</button>
                  <button>Elinar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BodyClients;
