import { createBrowserRouter } from "react-router";
import { PAGE_ROUTES } from "../constant/routes";
import { lazy } from "react";

const BodyLayout = lazy(() =>
  import("../components/layout/MainLayout.tsx").then((module) => ({
    default: module.BodyLayout,
  }))
);

const InventoryView = lazy(() =>
  import("../views/inventory/InventoryView.tsx").then((module) => ({
    default: module.InventoryView,
  }))
);

const HomeView = lazy(() =>
  import("../views/home/HomeView.tsx").then((module) => ({
    default: module.HomeView,
  }))
);

const ClientsView = lazy(() =>
  import("../views/clients/ClientsView.tsx").then((module) => ({
    default: module.ClientsView,
  }))
);

const RevestimientoView = lazy(() =>
  import("../views/revestimiento/RevestimientoView.tsx").then((module) => ({
    default: module.RevestimientoView,
  }))
);

const ReparacionesView = lazy(() =>
  import("../views/reparaciones/ReparacionesView.tsx").then((module) => ({
    default: module.ReparacionesView,
  }))
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: BodyLayout,
    children: [
      {
        index: true,
        Component: HomeView,
      },
    ],
  },
  {
    path: PAGE_ROUTES.Clientes,
    Component: BodyLayout,
    children: [
      {
        index: true,
        Component: ClientsView,
      },
    ],
  },
  {
    path: PAGE_ROUTES.Inventario,
    Component: BodyLayout,
    children: [
      {
        index: true,
        Component: InventoryView,
      },
    ],
  },
  {
    path: PAGE_ROUTES.Revestimiento,
    Component: BodyLayout,
    children: [
      {
        index: true,
        Component: RevestimientoView,
      },
    ],
  },
  {
    path: PAGE_ROUTES.Trabajos,
    Component: BodyLayout,
    children: [
      {
        index: true,
        Component: ReparacionesView,
      },
    ],
  },
  {
    path: PAGE_ROUTES.Trabajos,
    Component: BodyLayout,
    children: [
      {
        index: true,
        Component: ReparacionesView,
      },
    ],
  },
]);
