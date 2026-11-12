import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "react-router";
import { router } from "./router/index.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n.ts";
import FontScaleRoot from "./components/a11y/FontScaleRoot.tsx";
import { registerSW } from "virtual:pwa-register";

// Registro automático del Service Worker para PWA y notificaciones push
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("PWA: Hay una nueva versión disponible.");
  },
  onOfflineReady() {
    console.log("PWA: Aplicación lista para operar sin conexión.");
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div data-theme="light">
      <QueryClientProvider client={queryClient}>
        <FontScaleRoot>
          <RouterProvider router={router} />
        </FontScaleRoot>
      </QueryClientProvider>
    </div>
  </StrictMode>
);
