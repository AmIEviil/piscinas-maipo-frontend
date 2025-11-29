import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createLoginSlice, type LoginSlice } from "./AuthStore";
import { createClientFilterSlice, type ClientFilterSlice } from "./ClientStore";

type BoundStore = LoginSlice & ClientFilterSlice;

export const useBoundStore = create<BoundStore>()(
  persist(
    (...a) => ({
      ...createLoginSlice(...a),
      ...createClientFilterSlice(...a),
    }),
    { name: "bound-store" }
  )
);
