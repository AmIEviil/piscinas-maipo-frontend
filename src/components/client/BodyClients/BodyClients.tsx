import React, { useEffect, useState } from "react";
import { useClient } from "../../../hooks/ClientHooks";
import type { Client } from "../../../service/clientInterface";

const BodyClients = () => {
  const clientMutation = useClient();

  const [clients, setClients] = useState<Client[]>();

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
      <div className="tableContainer">
        <table>
          <thead>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Comuna</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Dia de Mantención</th>
            <th>Valor Mantención</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BodyClients;
