import type { User } from "../../service/usuarios.interface";
import apiClient from "../client/client";

export interface Migration {
  name: string;
  timestamp: string | null;
  formattedDate: string | null;
}

export interface MigrationResponse {
  executed: Migration[];
  pending: Migration[];
  summary: {
    totalExecuted: number;
    totalPending: number;
    totalMigrations: number;
  };
}

export interface MigrationHistory {
  id: string;
  migration_name: string;
  action: "EXECUTE" | "REVERT";
  user_id: string;
  details: {
    userId: string;
    migrationName: string;
  };
  executed_at: string;
  success: boolean;
  error_message: string;
  user: User;
}

export const MigrationsService = {
  getAllMigrations: async (
    token: string,
    order: "asc" | "desc"
  ): Promise<MigrationResponse> => {
    try {
      const response = await apiClient.get("api/migrations", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: { order },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching migration status:", error);
      throw error;
    }
  },

  getHistoryMigrations: async (token: string): Promise<MigrationHistory[]> => {
    try {
      const response = await apiClient.get("api/migrations/history", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching migration history:", error);
      throw error;
    }
  },

  executeMigration: async (
    migrationName: string,
    userId: string
  ): Promise<void> => {
    try {
      const response = await apiClient.post(
        `api/migrations/execute/${migrationName}/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error executing migration:", error);
      throw error;
    }
  },

  revertMigration: async (
    migrationName: string,
    userId: string
  ): Promise<void> => {
    try {
      const response = await apiClient.post(
        `api/migrations/revert/${migrationName}/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error reverting migration:", error);
      throw error;
    }
  },
};
