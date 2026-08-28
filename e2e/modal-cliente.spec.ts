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
 * Tambien vive aca el barrido de doce combinaciones (Task 19): tres anchos
 * por dos niveles de letra por dos temas, comprobando en cada pestana que no
 * hay desborde horizontal ni controles bajo el area tactil minima.
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

/**
 * Fija el nivel de tamano de letra antes del primer render.
 *
 * Copiado del mismo mecanismo que `seedBrowser` en responsive.spec.ts: se
 * escribe la clave del store persistido (`FONT_SCALE_STORAGE_KEY` en
 * src/store/A11yStore.ts) via addInitScript, para que la app arranque
 * directamente en el nivel elegido en vez de tener que manipular el TopBar
 * en cada test.
 */
const aplicarNivelDeLetra = async (page: Page, nivel: number) => {
  await page.addInitScript(
    (n) => localStorage.setItem("piscinas-font-scale-level", String(n)),
    nivel
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

test("marcar pago encadena la hoja de cobro, y nunca hay dos abiertas", async ({ page }) => {
  await abrirPrimerCliente(page);
  await page.getByRole("button", { name: /registrar mantencion/i }).click();

  // "Guardar mantencion"/"Guardar y registrar el pago" viene deshabilitado
  // hasta que la visita este marcada como realizada o tenga algun producto
  // (ver MaintenanceSheet.tsx, prop disabled del boton primario).
  await page.getByRole("radio", { name: /si, se hizo/i }).check();
  await page.getByRole("radio", { name: /si, pago/i }).check();
  await expect(page.getByText(/paso 1 de 2/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /guardar y registrar el pago/i })
  ).toBeVisible();

  await page.getByRole("button", { name: /guardar y registrar el pago/i }).click();

  const hojaPago = page.getByRole("dialog", { name: /registrar el pago/i });
  await expect(hojaPago).toBeVisible();
  await expect(page.getByText(/la mantencion quedo guardada/i)).toBeVisible();

  // La hoja de mantencion ya no esta.
  await expect(
    page.getByRole("dialog", { name: /registrar mantencion/i })
  ).toBeHidden();

  // Nunca dos hojas abiertas a la vez. Se cuenta por [aria-modal="true"] y
  // no por el rol "dialog" a secas: el <Modal> de react-bootstrap que
  // envuelve toda la ficha del cliente tambien trae role="dialog" (ver
  // react-bootstrap/esm/Modal.js) pero no aria-modal, asi que un conteo sin
  // filtrar contaria ese modal de fondo mas la hoja de pago y siempre daria
  // 2, incluso con el encadenado funcionando bien.
  expect(
    await page.locator('[role="dialog"][aria-modal="true"]:visible').count()
  ).toBe(1);
});

const VIEWPORTS = [
  { name: "celular-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "escritorio-1440", width: 1440, height: 900 },
];
/** Indices de FONT_SCALE_STEPS en src/store/A11yStore.ts: minimo y maximo. */
const FONT_LEVELS = [0, 4];
const TEMAS = ["light", "dark"] as const;

for (const viewport of VIEWPORTS) {
  for (const nivel of FONT_LEVELS) {
    for (const tema of TEMAS) {
      test(`modal sin desbordes: ${viewport.name} letra ${nivel} tema ${tema}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await aplicarNivelDeLetra(page, nivel);
        await abrirPrimerCliente(page);

        // El tema no vive en <html>. main.tsx lo fija en un
        // <div data-theme="light"> dentro de #root (ver src/main.tsx), y las
        // variables de tokens.css lo seleccionan con un combinador
        // descendiente (`:root { [data-theme="dark"] { ... } }` compila a
        // `:root [data-theme="dark"]`, ver src/index.css). document.
        // documentElement ES :root, no un descendiente de si mismo, asi que
        // escribirle el atributo ahi no cambia ninguna variable -verificado
        // en un HTML minimo con Playwright antes de escribir este test-.
        // chartPalette.ts ubica el mismo nodo con
        // `document.querySelector("[data-theme]")`; se reusa ese selector
        // para apuntar al elemento correcto. Tambien se aplica despues de
        // abrirPrimerCliente: antes de navegar ese nodo todavia no existe,
        // asi que hacerlo antes (como en la version original de este bloque)
        // es un no-op que la navegacion descarta igual.
        await page.evaluate(
          (t) =>
            document.querySelector("[data-theme]")?.setAttribute("data-theme", t),
          tema
        );

        // Umbral real del area tactil minima, calculado en vivo a partir de
        // --tap-min (2.75rem, ver src/styles/tokens.css) y del font-size ya
        // resuelto de <html> para este nivel de letra. Ni 40 ni 44px sirven
        // como constante fija: --tap-min crece con el nivel de fuente (66px
        // en el nivel 4), asi que un umbral fijo deja de detectar
        // violaciones reales apenas se sube la letra -pasaria un boton de
        // 50px en nivel 4, que incumple el area tactil real-. Leer la
        // variable en vez de repetir "2.75" tambien evita que este test y
        // tokens.css puedan desincronizarse si el token cambia.
        const tapMinPx = await page.evaluate(() => {
          const raiz = getComputedStyle(document.documentElement);
          const fontSizeRaizPx = parseFloat(raiz.fontSize);
          const tapMinRem = parseFloat(raiz.getPropertyValue("--tap-min"));
          return fontSizeRaizPx * tapMinRem;
        });

        for (const pestana of ["Mantenciones", "Cobros", "Ficha"]) {
          await page.getByRole("tab", { name: new RegExp(pestana, "i") }).click();

          // El modal nunca scrollea en horizontal.
          const desborde = await page.evaluate(() => {
            const panel = document.querySelector(
              "[role=tabpanel][data-activo=si]"
            );
            if (!panel) return 0;
            return panel.scrollWidth - panel.clientWidth;
          });
          expect(desborde).toBeLessThanOrEqual(1);

          // Ningun control por debajo del area tactil minima real.
          //
          // El selector va mas alla de <button>: Cobros trae un enlace de
          // descarga (PaymentCard.tsx, <a href>) y Ficha trae <select>
          // (ClientProfilePanel.tsx), y ambos son tan tocables como un
          // boton. [tabindex] cubre cualquier control custom con foco
          // explicito que no encaje en los roles anteriores.
          //
          // La visibilidad no se decide con `offsetParent !== null`: da
          // null para position:fixed -un elemento visible que quedaria
          // afuera del barrido sin razon- y no distingue un input con
          // opacity 0. Varios checkboxes/radios del modal
          // (MaintenanceSheet.module.css, PaymentSheet.module.css,
          // customCheckBox.module.css) ocultan asi el input nativo a
          // proposito y delegan el area tactil a un <span> hermano con su
          // propio min-height (patron de accesibilidad estandar, no un
          // bug); contar ese input a secas seria un falso positivo.
          // `checkVisibility({ checkOpacity: true })` excluye ese input
          // oculto -verificado que devuelve false ahi- y sigue contando el
          // <span> visible que lo acompana, y a diferencia de offsetParent
          // no descarta los elementos con position:fixed.
          const chicos = await page.evaluate((tapMin) => {
            const panel = document.querySelector(
              "[role=tabpanel][data-activo=si]"
            );
            if (!panel) return [];
            const selector =
              'button, a[href], input, select, textarea, ' +
              '[role="button"], [role="tab"], [role="radio"], ' +
              '[role="checkbox"], [role="switch"], ' +
              '[tabindex]:not([tabindex="-1"])';
            return Array.from(panel.querySelectorAll(selector))
              .filter((el) => el.checkVisibility({ checkOpacity: true }))
              .map((el) => {
                const rect = el.getBoundingClientRect();
                return {
                  texto: el.textContent?.trim().slice(0, 40) ?? "",
                  medida: Math.min(rect.width, rect.height),
                };
              })
              .filter((el) => el.medida < tapMin);
          }, tapMinPx);
          expect(chicos).toEqual([]);

          await page.screenshot({
            path: `e2e/screenshots/modal-${viewport.name}-letra${nivel}-${tema}-${pestana}.png`,
          });
        }
      });
    }
  }
}

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
