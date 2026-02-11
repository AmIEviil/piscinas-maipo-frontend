import { roles } from "../utils/roleUtils";

export const PAGE_ROUTES = {
  Login: "/login",
  Home: "/home",
  Clientes: "/clientes",
  Usuarios: "/usuarios",
  Inventario: "/inventario",
  Empleados: "/empleados",
  Vehiculos: "/vehiculos",
  Revestimiento: "/revestimiento",
  Trabajos: "/trabajos",
  Migraciones: "/migraciones",
};

export const topbarOptions = [
  {
    name: "Inicio",
    path: "/",
    icon: "home",
    canAccess: [roles.SUPER_ADMIN, roles.ADMIN, roles.TEC],
  },
  {
    name: "Clientes",
    path: PAGE_ROUTES.Clientes,
    icon: "clients",
    canAccess: [roles.SUPER_ADMIN, roles.ADMIN, roles.TEC],
  },
  {
    name: "Inventario",
    path: PAGE_ROUTES.Inventario,
    icon: "inventory",
    canAccess: [roles.SUPER_ADMIN, roles.ADMIN],
  },
  {
    name: "Trabajos",
    path: PAGE_ROUTES.Trabajos,
    icon: "works",
    canAccess: [roles.SUPER_ADMIN, roles.ADMIN],
  },
  {
    name: "Empleados",
    path: PAGE_ROUTES.Empleados,
    canAccess: [roles.SUPER_ADMIN],
    icon: "employees",
  },
  {
    name: "Vehículos",
    path: PAGE_ROUTES.Vehiculos,
    canAccess: [roles.SUPER_ADMIN],
    icon: "vehicles",
  },
  {
    name: "Usuarios",
    path: PAGE_ROUTES.Usuarios,
    canAccess: [roles.SUPER_ADMIN],
    icon: "users",
  },
  {
    name: "Migraciones",
    path: PAGE_ROUTES.Migraciones,
    canAccess: [roles.SUPER_ADMIN],
    icon: "migration",
  },
  {
    name: "Cerrar Sesión",
    path: PAGE_ROUTES.Login,
    canAccess: [roles.SUPER_ADMIN, roles.ADMIN, roles.TEC],
    icon: "logout",
  },
];
