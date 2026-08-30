import { test, expect, type Page, request } from "@playwright/test";

/**
 * Revision de los controles de formulario dentro de la ficha de cliente.
 *
 * Cubre dos defectos concretos que aparecieron en uso real y que la revision
 * por vista no detectaba, porque solo miraba el desbordamiento horizontal de
 * la pagina y estos controles viven dentro de un modal:
 *
 *  - El selector Si/No media 23px de ancho fijos: al subir el tamano de letra
 *    las dos opciones se montaban una sobre otra.
 *  - Los iconos de editar y eliminar de la tabla de mantenciones se encogian
 *    hasta 6px, porque una regla generica les aplicaba max-width:100% dentro
 *    de una celda estrecha.
 *
 * El formulario se abre pero nunca se guarda: no escribe nada en la base.
 */

const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";

const VIEWPORTS = [
  { name: "celular-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "escritorio-1440", width: 1440, height: 900 },
];

const FONT_LEVELS = [0, 4];

/** Alto minimo aceptable de un control, en px, por nivel de letra. */
const MIN_CONTROL_HEIGHT = 32;
/** Lado minimo aceptable de un icono de accion, en px. */
const MIN_ICON_SIZE = 20;

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

/** Abre la ficha del primer cliente del listado. */
const openFirstClient = async (page: Page) => {
  await page.goto("/clientes", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const verButton = page
    .locator("tbody button")
    .filter({ has: page.locator('svg[data-testid="VisibilityIcon"]') })
    .first();

  await verButton.click();
  await expect(page.locator(".modal.show")).toBeVisible();
  await page.waitForTimeout(2500);
};

/**
 * En celular la lista de mantenciones arranca colapsada, asi que hay que
 * desplegarla antes de poder revisar sus iconos de accion.
 */
const expandMaintenances = async (page: Page) => {
  if ((await page.locator(".modal td button svg").count()) > 0) return;

  const toggle = page.locator(".modal", { hasText: "Ver Mantenciones" })
    .locator("text=Ver Mantenciones")
    .first();

  if ((await toggle.count()) > 0) {
    await toggle.click();
    await page.waitForTimeout(2000);
  }
};

for (const viewport of VIEWPORTS) {
  for (const fontLevel of FONT_LEVELS) {
    test.describe(`${viewport.name} · letra nivel ${fontLevel + 1}`, () => {
      test("los selectores Si/No del formulario de mantencion son legibles", async ({
        browser,
      }) => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          baseURL: BASE_URL,
        });
        const page = await context.newPage();
        await seedBrowser(page, fontLevel);
        await openFirstClient(page);

        await page
          .locator("button", { hasText: "Agregar nueva mantención" })
          .first()
          .click();
        await page.waitForTimeout(1500);

        // Cada selector tiene exactamente dos opciones: Si y No.
        const switches = page.locator('.modal [class*="switchContainerShort"]');
        const total = await switches.count();
        expect(total, "no se encontro ningun selector Si/No").toBeGreaterThan(0);

        // En celular los selectores quedan por debajo del pliegue del modal.
        // Se desplazan a la vista antes de capturar; fullPage no sirve, porque
        // detras hay un listado de clientes de mas de cien mil pixeles de alto.
        await switches.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: `e2e/screenshots/form-${viewport.name}-letra${fontLevel + 1}-nueva-mantencion.png`,
        });

        for (let i = 0; i < total; i++) {
          const options = switches.nth(i).locator("button");
          expect(await options.count()).toBe(2);

          const first = await options.nth(0).boundingBox();
          const second = await options.nth(1).boundingBox();
          expect(first).not.toBeNull();
          expect(second).not.toBeNull();

          for (const box of [first!, second!]) {
            expect(
              box.height,
              `opcion del selector demasiado baja (${box.height}px)`
            ).toBeGreaterThanOrEqual(MIN_CONTROL_HEIGHT);
            // Ancho suficiente para que quepa la palabra completa.
            expect(
              box.width,
              `opcion del selector demasiado angosta (${box.width}px)`
            ).toBeGreaterThanOrEqual(MIN_CONTROL_HEIGHT);
          }

          // Las dos opciones no pueden solaparse.
          const separadas =
            first!.x + first!.width <= second!.x + 1 ||
            second!.x + second!.width <= first!.x + 1;
          expect(
            separadas,
            "las opciones Si y No se montan una sobre otra"
          ).toBe(true);
        }

        await context.close();
      });

      test("el formulario de cliente es legible", async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          baseURL: BASE_URL,
        });
        const page = await context.newPage();
        await seedBrowser(page, fontLevel);

        await page.goto("/clientes", { waitUntil: "networkidle" });
        await page.waitForTimeout(2000);

        // Se abre en modo edicion, no en creacion: la casilla "Cliente Activo"
        // solo existe al editar, y es el control que interesa revisar aca.
        await page
          .locator("tbody button")
          .filter({ has: page.locator('svg[data-testid="EditIcon"]') })
          .first()
          .click();
        await expect(page.locator(".modal.show")).toBeVisible();
        await page.waitForTimeout(1500);

        const checkbox = page.locator('.modal [class*="checkmark"]').first();
        await expect(checkbox).toBeVisible();
        await checkbox.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: `e2e/screenshots/form-${viewport.name}-letra${fontLevel + 1}-editar-cliente.png`,
        });

        // La casilla se dimensiona en em: debe crecer con la letra en lugar de
        // quedarse en los 24px fijos que tenia antes.
        const box = await checkbox.boundingBox();
        expect(box).not.toBeNull();
        const minimo = fontLevel === 0 ? 20 : 30;
        expect(
          Math.min(box!.width, box!.height),
          `casilla de ${Math.round(box!.width)}px, no acompana al tamano de letra`
        ).toBeGreaterThanOrEqual(minimo);

        await context.close();
      });

      test("los iconos de accion de la tabla de mantenciones se ven", async ({
        browser,
      }) => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          baseURL: BASE_URL,
        });
        const page = await context.newPage();
        await seedBrowser(page, fontLevel);
        await openFirstClient(page);
        await expandMaintenances(page);

        const icons = page.locator(".modal td button svg");
        const total = await icons.count();

        // Un cliente sin mantenciones en el mes no muestra tabla; en ese caso
        // no hay nada que revisar y la prueba no aplica.
        test.skip(total === 0, "el cliente no tiene mantenciones este mes");

        for (let i = 0; i < total; i++) {
          const box = await icons.nth(i).boundingBox();
          if (!box) continue;
          expect(
            Math.min(box.width, box.height),
            `icono de accion de ${Math.round(box.width)}x${Math.round(box.height)}px, demasiado pequeno para verse`
          ).toBeGreaterThanOrEqual(MIN_ICON_SIZE);
        }

        await context.close();
      });
    });
  }
}
