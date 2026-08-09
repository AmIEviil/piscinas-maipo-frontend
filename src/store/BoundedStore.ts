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
    {
      name: "piscinas-store",
      // Antes se serializaba el store completo a localStorage: nombre,
      // apellido, email, last_login, intentos fallidos y refresh_token del
      // usuario quedaban en el navegador sin expiración y legibles por
      // cualquier script del origen.
      //
      // De `userData` solo se conserva lo que la UI necesita tras recargar la
      // página: el rol (gating de rutas y menú) y el identificador. El resto
      // vive en memoria mientras dura la sesión. `token` tampoco se duplica
      // aquí: ya está en la clave "token".
      partialize: (state) => {
        const { token: _token, userData, ...rest } = state;
        return {
          ...rest,
          userData: userData
            ? {
                id: userData.id,
                user_name: userData.user_name,
                roleUser: userData.roleUser,
              }
            : undefined,
        } as unknown as BoundStore;
      },
    }
  )
);
