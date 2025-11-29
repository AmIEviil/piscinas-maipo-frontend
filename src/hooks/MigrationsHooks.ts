import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MigrationsService } from "../core/services/MigrationsService";
import { useBoundStore } from "../store/BoundedStore";

export const useGetAllMigrations = (order: "asc" | "desc") => {
  const token = useBoundStore((state) => state.token);
  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("No token found");
      const response = await MigrationsService.getAllMigrations(token, order);
      return response;
    },
    onError: (error) => {
      console.error("Error fetching migrations:", error);
    },
  });
};

export const useGetHistoryMigrations = () => {
  const token = useBoundStore((state) => state.token);
  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("No token found");
      const response = await MigrationsService.getHistoryMigrations(token);
      return response;
    },
    onError: (error) => {
      console.error("Error fetching migrations:", error);
    },
  });
};

export const useExecuteMigration = () => {
  const queryClient = useQueryClient();
  const userId = useBoundStore((state) => state.userData?.id);
  return useMutation({
    mutationFn: async (migrationName: string) => {
      const response = await MigrationsService.executeMigration(
        migrationName,
        userId!
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["migrations"] });
    },
  });
};

export const useRevertMigration = () => {
  const queryClient = useQueryClient();
  const userId = useBoundStore((state) => state.userData?.id);
  return useMutation({
    mutationFn: async (migrationName: string) => {
      const response = await MigrationsService.revertMigration(
        migrationName,
        userId!
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["migrations"] });
    },
  });
};
