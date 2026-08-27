import { defineConfig } from "@playwright/test";

/**
 * Configuracion para la revision responsive.
 *
 * No levanta el servidor: se asume que `yarn dev` (5173) y el backend (3000)
 * ya estan corriendo, que es como se trabaja en local.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    ignoreHTTPSErrors: true,
  },
});
