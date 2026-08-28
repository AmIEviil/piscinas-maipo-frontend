import { test, expect, type Page, request } from "@playwright/test";

/**
 * Accesibilidad de la hoja deslizante (SlideSheet) dentro del modal de ficha
 * del cliente.
 *
 * Es un dialogo dentro de otro dialogo: el modal de react-bootstrap se abre
 * con enforceFocus={false} precisamente para dejarle a la hoja el control del
 * foco. Este spec verifica las tres cosas de las que la hoja se hace cargo -
 * atrapar el Tab, cerrar con Escape y devolver el foco a quien la abrio - y
 * no de nada mas.
 *
 * Queda en rojo desde la Task 7 hasta la Task 15: recien ahi existe el boton
 * "Registrar mantencion" que abre la hoja y el tablist que la acompana. Es el
 * criterio de aceptacion de toda la fase de hojas.
 *
 * La sesion se obtiene llamando al endpoint de login y sembrando el
 * almacenamiento local, en vez de rellenar el formulario: es mas rapido y no
 * deja la contrasena escrita en ningun archivo del repositorio.
 *
 * Uso:
 *   E2E_USER=... E2E_PASSWORD=... npx playwright test e2e/modal-cliente.spec.ts
 */

const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";

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

/** Deja la sesion lista antes del primer render. */
const seedBrowser = async (page: Page) => {
  await page.addInitScript(
    ({ token, userData }) => {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "piscinas-store",
        JSON.stringify({ state: { token, userData }, version: 0 })
      );
    },
    { token: session.token, userData: session.userData }
  );
};

test.beforeEach(async ({ page }) => {
  await seedBrowser(page);
});

test("la hoja deslizante atrapa el foco y cierra con Escape", async ({ page }) => {
  await abrirPrimerCliente(page);

  await page.getByRole("button", { name: /registrar mantencion/i }).click();
  const hoja = page.getByRole("dialog", { name: /registrar mantencion/i });
  await expect(hoja).toBeVisible();

  // El foco entra en la hoja.
  await expect(hoja).toContainText("Fecha de la visita");
  const focoInicial = await page.evaluate(
    () => document.activeElement?.closest("[role=dialog]") !== null
  );
  expect(focoInicial).toBe(true);

  // Tabular muchas veces nunca saca el foco de la hoja.
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const dentro = await page.evaluate(
      () => document.activeElement?.closest("[role=dialog]") !== null
    );
    expect(dentro).toBe(true);
  }

  // Escape cierra y devuelve el foco al boton que la abrio.
  await page.keyboard.press("Escape");
  await expect(hoja).toBeHidden();
  const textoEnfocado = await page.evaluate(
    () => document.activeElement?.textContent ?? ""
  );
  expect(textoEnfocado.toLowerCase()).toContain("registrar mantencion");
});

/**
 * Abre el modal del primer cliente del listado.
 *
 * La fila de la tabla no tiene su propio manejador de click (ver
 * BodyClients.tsx): lo que abre el modal es el boton "Ver" con el icono
 * VisibilityIcon, igual que en openFirstClient de formularios.spec.ts.
 */
async function abrirPrimerCliente(page: Page) {
  await page.goto(`${BASE_URL}/clientes`);
  await page.waitForLoadState("networkidle");
  await page
    .locator("table tbody button")
    .filter({ has: page.locator('svg[data-testid="VisibilityIcon"]') })
    .first()
    .click();
  await expect(page.locator("[role=tablist]")).toBeVisible();
}
