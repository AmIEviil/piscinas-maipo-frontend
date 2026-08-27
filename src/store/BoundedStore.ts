import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createLoginSlice, type LoginSlice } from "./AuthStore";
import { createClientFilterSlice, type ClientFilterSlice } from "./ClientStore";
import { createFormSlice, type FormStoreSlice } from "./FormStore";
import { createA11ySlice, type A11ySlice } from "./A11yStore";

type BoundStore = LoginSlice & ClientFilterSlice & FormStoreSlice & A11ySlice;

export const useBoundStore = create<BoundStore>()(
  persist(
    (...a) => ({
      ...createLoginSlice(...a),
      ...createClientFilterSlice(...a),
      ...createFormSlice(...a),
      ...createA11ySlice(...a),
    }),
    {
      name: "piscinas-store",
      // fontScaleLevel se guarda aparte (ver A11yStore). Si tambien viviera
      // aca, la rehidratacion del bound store pisaria el valor que el script
      // inline de index.html ya aplico.
      partialize: (state) => {
        const persisted: Partial<BoundStore> = { ...state };
        delete persisted.fontScaleLevel;
        return persisted;
      },
    }
  )
);
