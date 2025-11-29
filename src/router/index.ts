import { createBrowserRouter } from "react-router";
import { PAGE_ROUTES } from "../constant/routes";
import { lazy } from "react";

// Layouts
const AuhtLayout = lazy(() =>
  import("../components/layout/AuthLayout.tsx").then((module) => ({
    default: module.AuthLayout,
  }))
);

const BodyLayout = lazy(() =>
  import("../components/layout/MainLayout.tsx").then((module) => ({
    default: module.BodyLayout,
  }))
);

// Views Publicas
const LoginView = lazy(() =>
  import("../views/login/LoginView.tsx").then((module) => ({
    default: module.Login,
  }))
);

// const BlockedView = lazy(() =>
//   import("../views/login/BlockedView.tsx").then((m) => ({
//     default: m.BlockedView,
//   }))
// );
// const RecoverPasswordView = lazy(() =>
//   import("../views/recuperar-contraseña/RecoverPasswordView.tsx").then((m) => ({
//     default: m.RecoverPasswordView,
//   }))
// );
// const RecoverSuccessView = lazy(() =>
//   import("../views/recuperar-contraseña/RecoverSuccessView.tsx").then((m) => ({
//     default: m.RecoverSuccessView,
//   }))
// );
// const ConfigNewPasswordView = lazy(() =>
//   import("../views/set-new-password/ConfigNewPasswordView.tsx").then((m) => ({
//     default: m.ConfigNewPassWordView,
//   }))
// );
// const RegisterUser = lazy(() =>
//   import("../views/login/Register.tsx").then((m) => ({
//     default: m.RegisterUser,
//   }))
// );
// const SetEmail = lazy(() =>
//   import("../views/login/SetEmailView.tsx").then((m) => ({
//     default: m.SetEmail,
//   }))
// );

// Views Privadas
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

const UsuariosView = lazy(() =>
  import("../views/users/UsuariosView.tsx").then((module) => ({
    default: module.UsuariosView,
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

const MigrationViewProtected = lazy(() =>
  import("../views/migrations/MigrationView.tsx").then((module) => ({
    default: module.MigrationViewProtected,
  }))
);

export const router = createBrowserRouter(
  [
    {
      path: PAGE_ROUTES.Login,
      Component: AuhtLayout,
      // ErrorBoundary: ErrorPage,
      children: [
        { index: true, Component: LoginView },
        //   { path: PAGE_ROUTES.Blocked, Component: BlockedView },
        //   {
        //     path: PAGE_ROUTES.RecuperarContraseña,
        //     Component: RecoverPasswordView,
        //   },
        //   {
        //     path: PAGE_ROUTES.RecuperarContraseñaExito,
        //     Component: RecoverSuccessView,
        //   },
        //   {
        //     path: PAGE_ROUTES.ConfigNuevaContraseña,
        //     Component: ConfigNewPasswordView,
        //   },
        //   { path: PAGE_ROUTES.RegistrarCorreo, Component: SetEmail },
        //   { path: PAGE_ROUTES.Register, Component: RegisterUser },
      ],
    },
    {
      children: [
        {
          Component: BodyLayout,
          path: "/",
          children: [
            {
              index: true,
              Component: HomeView,
            },
            {
              path: PAGE_ROUTES.Migraciones,
              Component: MigrationViewProtected,
            },
            {
              path: PAGE_ROUTES.Clientes,
              Component: ClientsView,
            },
            {
              path: PAGE_ROUTES.Inventario,
              Component: InventoryView,
            },
            {
              path: PAGE_ROUTES.Revestimiento,
              Component: RevestimientoView,
            },
            {
              path: PAGE_ROUTES.Trabajos,
              Component: ReparacionesView,
            },
            {
              path: PAGE_ROUTES.Usuarios,
              Component: UsuariosView,
            },
          ],
        },
      ],
    },
  ],
  { basename: "/" }
);
