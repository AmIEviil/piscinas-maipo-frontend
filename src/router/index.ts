import { createBrowserRouter } from "react-router";
import { PAGE_ROUTES } from "../constant/routes";
import { lazy } from "react";

const BodyLayout = lazy(() =>
  import("../components/layout/MainLayout.tsx").then((module) => ({
    default: module.BodyLayout,
  }))
);

const LoginView = lazy(() =>
  import("../views/login/LoginView.tsx").then((module) => ({
    default: module.LoginView,
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

export const router = createBrowserRouter([
  {
    path: PAGE_ROUTES.Login,
    Component: BodyLayout,
    children: [
      {
        index: true,
        Component: LoginView,
      },
    ],
  },
  {
    path: PAGE_ROUTES.Home,
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
]);
