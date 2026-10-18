import { describe, expect, it } from "vitest";
import {
  calcularValorNuevo,
  construirFilas,
  errorDeFila,
  itemsAEnviar,
  parsearCantidad,
  totales,
  valorFinal,
} from "./valorMantencion.utils";

const clientes = [
  { id: "A", nombre: "Ana", valor_mantencion: 20000 },
  { id: "B", nombre: "Beto", valor_mantencion: 23500 },
  { id: "C", nombre: "Carla", valor_mantencion: null },
];

const buscar = (filas: ReturnType<typeof construirFilas>, id: string) => {
  const fila = filas.find((f) => f.id === id);
  if (!fila) throw new Error(`fila ${id} no encontrada`);
  return fila;
};

describe("parsearCantidad monto", () => {
  it.each([
    ["1000", 1000],
    ["1.000", 1000],
    [" 2.500 ", 2500],
  ])("%s -> %d", (t, v) =>
    expect(parsearCantidad("monto", t)).toEqual({ valor: v, error: null }),
  );
  it.each(["", "0", "-1000", "abc", "1000,5"])("%s es invalido", (t) =>
    expect(parsearCantidad("monto", t).error).not.toBeNull(),
  );
  it("mensaje de error del monto", () =>
    expect(parsearCantidad("monto", "abc")).toEqual({
      valor: null,
      error: "Ingresa un monto entero mayor a $0",
    }));
});

describe("parsearCantidad porcentaje", () => {
  it.each([
    ["5", 5],
    ["3,5", 3.5],
    ["3.5", 3.5],
    [" 7 ", 7],
    ["100", 100],
  ])("%s -> %d", (t, v) =>
    expect(parsearCantidad("porcentaje", t)).toEqual({ valor: v, error: null }),
  );
  it.each(["", "0", "-3", "100,5", "3,55", "5%", "abc"])(
    "%s es invalido",
    (t) => expect(parsearCantidad("porcentaje", t).error).not.toBeNull(),
  );
  it("mensaje de error del porcentaje", () =>
    expect(parsearCantidad("porcentaje", "5%")).toEqual({
      valor: null,
      error: "Ingresa un porcentaje mayor a 0 y hasta 100, con máximo 1 decimal",
    }));
});

describe("calcularValorNuevo", () => {
  it("monto suma", () =>
    expect(calcularValorNuevo(23500, "monto", 1000)).toBe(24500));
  it("porcentaje redondea al $100 mas cercano", () => {
    expect(calcularValorNuevo(23500, "porcentaje", 7)).toBe(25100); // 25145
    expect(calcularValorNuevo(25000, "porcentaje", 0.6)).toBe(25200); // 25150 -> 25200
  });
  it("porcentaje sobre 0 da 0", () =>
    expect(calcularValorNuevo(0, "porcentaje", 5)).toBe(0));
});

describe("construirFilas / overrides", () => {
  it("el override sobrevive a cambiar modo y cantidad", () => {
    const ov = { B: 26000 };
    const f1 = construirFilas(clientes, "monto", 1000, ov);
    const f2 = construirFilas(clientes, "porcentaje", 5, ov);
    expect(valorFinal(buscar(f1, "B"))).toBe(26000);
    expect(valorFinal(buscar(f2, "B"))).toBe(26000);
    // las demas filas si siguen el calculo
    expect(valorFinal(buscar(f1, "A"))).toBe(21000);
    expect(valorFinal(buscar(f2, "A"))).toBe(21000);
  });

  it("quitar el override vuelve al calculado", () => {
    const fila = buscar(construirFilas(clientes, "monto", 1000, { B: null }), "B");
    expect(fila.override).toBeNull();
    expect(valorFinal(fila)).toBe(24500);
    expect(valorFinal(fila)).toBe(fila.calculado);
  });

  it("cantidad null deja calculado null y fila sin override invalida", () => {
    const filas = construirFilas(clientes, "monto", null, { B: 26000 });
    expect(filas.every((f) => f.calculado === null)).toBe(true);
    expect(errorDeFila(buscar(filas, "A"))).toBe("Ingresa un monto mayor a $0");
    expect(errorDeFila(buscar(filas, "B"))).toBeNull();
  });

  it("cliente con valor 0/null en porcentaje es invalido hasta tener override", () => {
    const sinOv = buscar(construirFilas(clientes, "porcentaje", 5, {}), "C");
    expect(sinOv.actual).toBe(0);
    expect(errorDeFila(sinOv)).toBe("Ingresa un monto mayor a $0");
    const conOv = buscar(construirFilas(clientes, "porcentaje", 5, { C: 20000 }), "C");
    expect(errorDeFila(conOv)).toBeNull();
  });

  it("un override 0 es un override real e invalido, no 'sin override'", () => {
    const fila = buscar(construirFilas(clientes, "monto", 1000, { B: 0 }), "B");
    expect(valorFinal(fila)).toBe(0);
    expect(errorDeFila(fila)).toBe("Ingresa un monto mayor a $0");
  });

  it("override no entero es invalido", () => {
    const fila = buscar(construirFilas(clientes, "monto", 1000, { B: 25000.5 }), "B");
    expect(errorDeFila(fila)).toBe("Ingresa un monto mayor a $0");
  });

  it("ordena por nombre", () => {
    const desordenados = [
      { id: "1", nombre: "Zoe", valor_mantencion: 1000 },
      { id: "2", nombre: "Álvaro", valor_mantencion: 1000 },
      { id: "3", nombre: "Mario", valor_mantencion: 1000 },
    ];
    const nombres = construirFilas(desordenados, "monto", 100, {}).map((f) => f.nombre);
    expect(nombres).toEqual(["Álvaro", "Mario", "Zoe"]);
  });
});

describe("itemsAEnviar / totales", () => {
  it("omite filas sin cambio y filas invalidas", () => {
    // A: override 20000 = actual (sin cambio); B: 23500 +5% -> 24700; C: sin valor, invalida
    const filas = construirFilas(clientes, "porcentaje", 5, { A: 20000 });
    expect(itemsAEnviar(filas)).toEqual([{ id: "B", valor: 24700 }]);
  });

  it("totales suma actual y valorFinal de filas validas", () => {
    // Interpretacion literal: ambas sumas solo sobre filas validas (C es invalida y no cuenta)
    const filas = construirFilas(clientes, "porcentaje", 5, {});
    expect(totales(filas)).toEqual({ actual: 20000 + 23500, nuevo: 21000 + 24700 });
  });

  it("totales de filas vacias o todas invalidas es 0", () => {
    expect(totales([])).toEqual({ actual: 0, nuevo: 0 });
    expect(totales(construirFilas(clientes, "monto", null, {}))).toEqual({
      actual: 0,
      nuevo: 0,
    });
  });
});
