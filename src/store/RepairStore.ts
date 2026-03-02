import { create } from "zustand";
import type { IRepair } from "../service/repairs.interface";
import { repairsService } from "../core/services/RepairsService";

interface RepairSlice {
  repairs: IRepair[];
  fetchRepairs: () => Promise<void>;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useRepairStore = create<RepairSlice>((set) => ({
  repairs: [],
  fetchRepairs: async () => {
    try {
      const response = await repairsService.getRepairs();
      if (!response) {
        throw new Error("Failed to fetch repairs");
      }
      const data: IRepair[] = response;
      set({ repairs: data });
    } catch (error) {
      console.error("Error fetching repairs:", error);
    }
  },
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
