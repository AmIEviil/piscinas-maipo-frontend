import { useBoundStore } from "../store/BoundedStore";

export const roles = {
  ADMIN: "Admin",
  CLIENT: "Cliente",
  TEC: "Tecnico",
};

export const usePermits = () => {
  const role = useBoundStore((state) => state.userData?.roleUser.role.nombre);
  return {
    isAdmin: role === roles.ADMIN,
    isClient: role === roles.CLIENT,
    isTec: role === roles.TEC,
  };
};
