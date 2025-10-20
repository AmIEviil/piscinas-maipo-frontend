export const PAGE_ROUTES = {
  Login: "/login",
  Home: "/home",
  Clientes: "/clientes",
  Inventario: "/inventario",
  Revestimiento: "/revestimiento",
  Trabajos: "/trabajos",
};

export const topbarOptions = [
  { name: "Inicio", path: "/", icon: "home" },
  { name: "Clientes", path: PAGE_ROUTES.Clientes, icon: "clients" },
  { name: "Inventario", path: PAGE_ROUTES.Inventario, icon: "inventory" },
  {
    name: "Revestimiento",
    path: PAGE_ROUTES.Revestimiento,
    icon: "revestimiento",
  },
  { name: "Trabajos", path: PAGE_ROUTES.Trabajos, icon: "works" },
];
