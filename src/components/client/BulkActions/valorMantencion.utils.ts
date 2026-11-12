// Lógica pura del alza masiva de valor de mantención (sin DOM ni React).

export type ModoAjuste = "monto" | "porcentaje";

const ERROR_MONTO = "Ingresa un monto entero mayor a $0";
const ERROR_PORCENTAJE =
  "Ingresa un porcentaje mayor a 0 y hasta 100, con máximo 1 decimal";
const ERROR_FILA = "Ingresa un monto mayor a $0";

// Interpreta lo que tipea la persona: "1.000", "3,5", " 5 " son válidos.
export function parsearCantidad(
  modo: ModoAjuste,
  texto: string,
): { valor: number | null; error: string | null } {
  const limpio = texto.trim();

  if (modo === "monto") {
    // Miles con punto o dígitos sueltos; sin decimales ni signo.
    if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(limpio)) {
      return { valor: null, error: ERROR_MONTO };
    }
    const valor = Number(limpio.replace(/\./g, ""));
    return valor > 0
      ? { valor, error: null }
      : { valor: null, error: ERROR_MONTO };
  }

  // Máximo 1 decimal, coma o punto.
  if (!/^\d+([.,]\d)?$/.test(limpio)) {
    return { valor: null, error: ERROR_PORCENTAJE };
  }
  const valor = Number(limpio.replace(",", "."));
  return valor > 0 && valor <= 100
    ? { valor, error: null }
    : { valor: null, error: ERROR_PORCENTAJE };
}

export function calcularValorNuevo(
  actual: number,
  modo: ModoAjuste,
  cantidad: number,
): number {
  if (modo === "monto") return actual + cantidad;
  // El incremento se calcula en décimas de punto porcentual enteras: multiplicar
  // por (1 + cantidad / 100) arrastra error de coma flotante (25149.999…) y
  // redondearía hacia abajo un valor que debería subir al $100 siguiente.
  const aumento = (actual * Math.round(cantidad * 10)) / 1000;
  return Math.round((actual + aumento) / 100) * 100;
}

export interface FilaValor {
  id: string;
  nombre: string;
  actual: number;
  calculado: number | null;
  override: number | null;
}

export function construirFilas(
  clientes: { id: string; nombre: string; valor_mantencion: number | null }[],
  modo: ModoAjuste,
  cantidad: number | null,
  overrides: Record<string, number | null>,
): FilaValor[] {
  return clientes
    .map((c) => {
      const actual = c.valor_mantencion ?? 0;
      return {
        id: c.id,
        nombre: c.nombre,
        actual,
        calculado:
          cantidad === null ? null : calcularValorNuevo(actual, modo, cantidad),
        // null o ausente = sin override (0 sí cuenta como override, inválido)
        override: overrides[c.id] ?? null,
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function valorFinal(fila: FilaValor): number | null {
  return fila.override ?? fila.calculado;
}

export function errorDeFila(fila: FilaValor): string | null {
  const valor = valorFinal(fila);
  if (valor === null || valor < 1 || !Number.isInteger(valor)) {
    return ERROR_FILA;
  }
  return null;
}

// Solo viajan las filas válidas cuyo valor realmente cambia.
export function itemsAEnviar(
  filas: FilaValor[],
): { id: string; valor: number }[] {
  const items: { id: string; valor: number }[] = [];
  for (const fila of filas) {
    const valor = valorFinal(fila);
    if (errorDeFila(fila) === null && valor !== null && valor !== fila.actual) {
      items.push({ id: fila.id, valor });
    }
  }
  return items;
}

// Ambas sumas consideran solo las filas válidas.
export function totales(filas: FilaValor[]): { actual: number; nuevo: number } {
  let actual = 0;
  let nuevo = 0;
  for (const fila of filas) {
    const valor = valorFinal(fila);
    if (errorDeFila(fila) === null && valor !== null) {
      actual += fila.actual;
      nuevo += valor;
    }
  }
  return { actual, nuevo };
}

// Cuenta solo los ajustes manuales que realmente viajan: un override igual al
// valor actual no se envia, y contarlo dejaria "K ajustados" mayor que "N".
export function contarAjustesEnviados(filas: FilaValor[]): number {
  const enviados = new Set(itemsAEnviar(filas).map((item) => item.id));
  return filas.filter((f) => f.override !== null && enviados.has(f.id)).length;
}
