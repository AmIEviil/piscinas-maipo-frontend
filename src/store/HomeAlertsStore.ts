import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type HomeAlertKey = "lowStock" | "mantencionesPendientes";

/**
 * Las alertas del Home se descartan "hasta el proximo inicio de sesion".
 * Por eso el estado vive en sessionStorage y no en el bound store: el logout
 * ejecuta StorageUtils.clearAllStorage(), que hace sessionStorage.clear(), asi
 * que la marca de descartado se borra sola al cerrar sesion (y tambien al
 * cerrar la pestana), sin tener que acordarse de limpiarla a mano.
 */
export const HOME_ALERTS_STORAGE_KEY = "piscinas-home-alerts";

const initialDismissed: Record<HomeAlertKey, boolean> = {
  lowStock: false,
  mantencionesPendientes: false,
};

interface HomeAlertsState {
  dismissed: Record<HomeAlertKey, boolean>;
  dismissAlert: (key: HomeAlertKey) => void;
  resetAlerts: () => void;
}

export const useHomeAlertsStore = create<HomeAlertsState>()(
  persist(
    (set) => ({
      dismissed: { ...initialDismissed },
      dismissAlert: (key) =>
        set((state) => ({ dismissed: { ...state.dismissed, [key]: true } })),
      resetAlerts: () => set({ dismissed: { ...initialDismissed } }),
    }),
    {
      name: HOME_ALERTS_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
