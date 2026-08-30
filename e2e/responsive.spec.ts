import { test, expect, type Page, request } from "@playwright/test";

/**
 * Revision responsive de todas las vistas.
 *
 * Recorre cada ruta en cuatro anchos y en dos niveles de tamano de letra (el
 * minimo y el maximo) y comprueba lo unico que nunca debe pasar: que el
 * documento se pueda desplazar en horizontal. Ademas guarda una captura de
 * cada combinacion en e2e/screenshots para poder mirarlas.
 *
 * La sesion se obtiene llamando al endpoint de login y sembrando el
 * almacenamiento local, en vez de rellenar el formulario: es mas rapido y no
 * deja la contrasena escrita en ningun archivo del repositorio.
 *
 * Uso:
 *   E2E_USER=... E2E_PASSWORD=... npx playwright test
 */

const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";

const VIEWPORTS = [
  { name: "celular-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "notebook-1024", width: 1024, height: 768 },
  { name: "escritorio-1440", width: 1440, height: 900 },
];

/** Indices de FONT_SCALE_STEPS en src/store/A11yStore.ts. */
const FONT_LEVELS = [0, 4];

const ROUTES = [
  { name: "home", path: "/" },
  { name: "clientes", path: "/clientes" },
  { name: "inventario", path: "/inventario" },
  { name: "trabajos", path: "/trabajos" },
  { name: "revestimiento", path: "/revestimiento" },
  { name: "vehiculos", path: "/vehiculos" },
  { name: "empleados", path: "/empleados" },
  { name: "usuarios", path: "/usuarios" },
  { name: "migraciones", path: "/migraciones" },
];

type Session = { token: string; userData: unknown };

let session: Session;

test.beforeAll(async () => {
  const user = process.env.E2E_USER;
  const password = process.env.E2E_PASSWORD;

  if (!user || !password) {
    throw new Error(
      "Falta E2E_USER o E2E_PASSWORD. Ejecuta: E2E_USER=... E2E_PASSWORD=... npx playwright test"
    );
  }

  const api = await request.newContext({ baseURL: API_URL });
  const response = await api.post("/api/auth/login", {
    data: { user_name: user, password },
  });

  if (!response.ok()) {
    throw new Error(
      `Login fallido (${response.status()}): ${await response.text()}`
    );
  }

  const body = await response.json();
  session = { token: body.accessToken, userData: body };
  await api.dispose();
});

/** Deja la sesion y el nivel de letra listos antes del primer render. */
const seedBrowser = async (page: Page, fontLevel: number) => {
  await page.addInitScript(
    ({ token, userData, fontLevel: level }) => {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "piscinas-store",
        JSON.stringify({ state: { token, userData }, version: 0 })
      );
      localStorage.setItem("piscinas-font-scale-level", String(level));
    },
    { token: session.token, userData: session.userData, fontLevel }
  );
};

for (const viewport of VIEWPORTS) {
  for (const fontLevel of FONT_LEVELS) {
    test.describe(`${viewport.name} · letra nivel ${fontLevel + 1}`, () => {
      for (const route of ROUTES) {
        test(`${route.name} no desborda en horizontal`, async ({ browser }) => {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            baseURL: BASE_URL,
          });
          const page = await context.newPage();
          await seedBrowser(page, fontLevel);

          await page.goto(route.path, { waitUntil: "networkidle" });
          // Las tablas cargan por React Query despues del primer render.
          await page.waitForTimeout(1500);

          await page.screenshot({
            path: `e2e/screenshots/${viewport.name}-letra${fontLevel + 1}-${route.name}.png`,
            fullPage: false,
          });

          const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));

          // 1px de tolerancia por redondeos de subpixel.
          expect(
            overflow.scrollWidth,
            `${route.name} desborda ${overflow.scrollWidth - overflow.clientWidth}px a lo ancho`
          ).toBeLessThanOrEqual(overflow.clientWidth + 1);

          await context.close();
        });
      }
    });
  }
}
