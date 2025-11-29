import { useEffect, useState } from "react";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";

import {
  formatDateFromTimestamp,
  formatTimeFromTimestamp,
} from "../../utils/DateUtils";
import MigrationModal from "../../components/common/MigrationModal/MigrationModal";

import { roles } from "../../utils/roleUtils";
import InfoIcon from "../../components/ui/Icons/InfoIcon";
import {
  useExecuteMigration,
  useGetAllMigrations,
  useGetHistoryMigrations,
  useRevertMigration,
} from "../../hooks/MigrationsHooks";
import type {
  MigrationHistory,
  MigrationResponse,
} from "../../core/services/MigrationsService";
import CaretIcon from "../../components/ui/Icons/CaretIcon";

export const MigrationViewProtected = () => {
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [data, setData] = useState<MigrationResponse>();
  const [historyData, setHistoryData] = useState<MigrationHistory[]>();

  const [showExecuted, setShowExecuted] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const getAllMigrationMutation = useGetAllMigrations(order);
  const getHistoryMigrationMutation = useGetHistoryMigrations();

  const executeMigration = useExecuteMigration();
  const revertMigration = useRevertMigration();

  const getAllMigrations = async () => {
    try {
      const response = await getAllMigrationMutation.mutateAsync();
      setData(response || undefined);
    } catch (error) {
      console.error("Error fetching migrations:", error);
      return null;
    }
  };

  const getAllHistoryMigrations = async () => {
    try {
      const response = await getHistoryMigrationMutation.mutateAsync();
      setHistoryData(response || undefined);
    } catch (error) {
      console.error("Error fetching history migrations:", error);
      return null;
    }
  };

  useEffect(() => {
    getAllMigrations();
    getAllHistoryMigrations();
  }, [order]);

  const handleExecuteMigration = async (migrationName: string) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres ejecutar la migración ${migrationName}?`
      )
    ) {
      try {
        await executeMigration.mutateAsync(migrationName);
        alert("Migración ejecutada correctamente");
      } catch (error: unknown) {
        alert(`Error al ejecutar la migración "${migrationName}": ${error}`);
      }
    }
  };

  const handleRevertMigration = async (migrationName: string) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres revertir la migración ${migrationName}?`
      )
    ) {
      try {
        await revertMigration.mutateAsync(migrationName);
        alert("Migración revertida correctamente");
      } catch (error) {
        alert(`Error al revertir la migración "${migrationName}": ${error}`);
      }
    }
  };

  const groupedHistory = historyData
    ? historyData.reduce<Record<string, MigrationHistory[]>>((acc, item) => {
        if (!acc[item.migration_name]) {
          acc[item.migration_name] = [];
        }
        acc[item.migration_name].push(item);
        return acc;
      }, {})
    : {};

  return (
    <ProtectedRoute allowedRoles={[roles.ADMIN]} redirectPath="/">
      <div className="w-full bg-white shadow-md rounded-lg">
        <div className="p-4 border-b border-gray-200 text-lg font-semibold flex items-center gap-2">
          <span>Resumen</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
            Total Migraciones creadas en backend:{" "}
            {data?.summary.totalMigrations || 0}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
            Total Migraciones ejecutadas: {data?.summary.totalExecuted || 0}
          </span>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
            Total Migraciones pendientes: {data?.summary.totalPending || 0}
          </span>
          <button onClick={() => setShowMigrationModal(true)}>
            <InfoIcon />
          </button>
        </div>

        <div>
          {/* Migraciones Ejecutadas */}
          {data?.executed && (
            <div className="p-4">
              <h3
                className="font-bold inline-flex items-center gap-2 cursor-pointer mb-2"
                onClick={() => setShowExecuted(!showExecuted)}
              >
                Ejecutadas
                {showExecuted ? <CaretIcon /> : <CaretIcon direction="right" />}
              </h3>
              {showExecuted && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-2  text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span>Ejecutada en</span>
                        <button
                          onClick={() => {
                            setOrder(order === "asc" ? "desc" : "asc");
                          }}
                        >
                          <CaretIcon
                            className="ml-1"
                            direction={order === "asc" ? "up" : "down"}
                          />
                        </button>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.executed.map((migration, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-200 odd:bg-gray-100"
                      >
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {migration.name}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {formatDateFromTimestamp(Number(migration.timestamp))}{" "}
                          -{" "}
                          {formatTimeFromTimestamp(Number(migration.timestamp))}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              handleRevertMigration(migration.name)
                            }
                            disabled={revertMigration.isPending}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {revertMigration.isPending
                              ? "Revertiendo..."
                              : "Revertir"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {data?.pending && (
            <div className="p-4">
              {data?.pending.length > 0 ? (
                <h3
                  className="font-bold inline-flex items-center gap-2 cursor-pointer mb-2"
                  onClick={() => setShowPending(!showPending)}
                >
                  Por ejecutar
                  {showPending ? (
                    <CaretIcon />
                  ) : (
                    <CaretIcon direction="right" />
                  )}
                </h3>
              ) : (
                <p className="font-bold text-2xl">
                  No hay migraciones pendientes
                </p>
              )}
              {showPending && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creada en
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.pending.map((migration, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-200 odd:bg-gray-100"
                      >
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {migration.name}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {formatDateFromTimestamp(Number(migration.timestamp))}
                          -
                          {formatTimeFromTimestamp(Number(migration.timestamp))}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              handleExecuteMigration(migration.name)
                            }
                            disabled={executeMigration.isPending}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {executeMigration.isPending
                              ? "Ejecutando..."
                              : "Ejecutar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {historyData && (
            <div className="p-4">
              <h3
                className="font-bold mb-2 inline-flex items-center gap-2 cursor-pointer"
                onClick={() => setShowHistory(!showHistory)}
              >
                Historial de Migraciones
                {showHistory ? <CaretIcon /> : <CaretIcon direction="right" />}
              </h3>
              {showHistory && (
                <>
                  {Object.keys(groupedHistory).length === 0 ? (
                    <p>No hay historial de migraciones.</p>
                  ) : (
                    Object.entries(groupedHistory).map(
                      ([migrationName, histories]) => (
                        <div key={migrationName} className="mb-4">
                          <h4 className="font-semibold mb-2">
                            {migrationName}
                          </h4>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Acción
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Usuario
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Fecha y Hora
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Estado
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Mensaje de Error
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {histories.map((history) => (
                                <tr
                                  key={history.id}
                                  className="hover:bg-blue-200 odd:bg-gray-100"
                                >
                                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {history.action === "EXECUTE"
                                      ? "Ejecutada"
                                      : "Revertida"}
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {history.user
                                      ? history.user.first_name +
                                        " " +
                                        history.user.last_name
                                      : "Desconocido"}
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(
                                      history.executed_at
                                    ).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {history.success ? "Exitoso" : "Fallido"}
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {history.error_message || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <MigrationModal
        visible={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
      />
    </ProtectedRoute>
  );
};
