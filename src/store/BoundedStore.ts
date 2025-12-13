import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createLoginSlice, type LoginSlice } from "./AuthStore";
import { createClientFilterSlice, type ClientFilterSlice } from "./ClientStore";
import { createFormSlice, type FormStoreSlice } from "./FormStore";

type BoundStore = LoginSlice & ClientFilterSlice & FormStoreSlice;

export const useBoundStore = create<BoundStore>()(
  persist(
    (...a) => ({
      ...createLoginSlice(...a),
      ...createClientFilterSlice(...a),
      ...createFormSlice(...a),
    }),
    { name: "piscinas-store" }
  )
);
