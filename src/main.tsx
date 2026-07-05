import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "react-router";
import { router } from "./router/index.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n.ts";
import { useBoundStore } from "./store/BoundedStore.ts";

const queryClient = new QueryClient();

const ThemeApplier = ({ children }: { children: React.ReactNode }) => {
  const theme = useBoundStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeApplier>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeApplier>
  </StrictMode>
);
