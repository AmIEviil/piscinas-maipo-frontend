import { useBoundStore } from "../store/BoundedStore";

export const roles = {
  SUPER_ADMIN: "Superadmin",
  ADMIN: "Admin",
  CLIENT: "Cliente",
  TEC: "Tecnico",
};

export const usePermits = () => {
  const role = useBoundStore((state) => state.userData?.roleUser.role.nombre);
  return {
    isSuperAdmin: role === roles.SUPER_ADMIN,
    isAdmin: role === roles.ADMIN,
    isClient: role === roles.CLIENT,
    isTec: role === roles.TEC,
  };
};
