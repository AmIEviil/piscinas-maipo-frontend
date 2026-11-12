import { describe, expect, it } from "vitest";
import { totalCobrableDelMes, valorDeVisita } from "./valorVisita";

const cloro = { product: { valor_unitario: 1000 }, cantidad: 2 };

describe("valorVisita", () => {
  it("usa el precio guardado en la visita, no el actual del cliente", () => {
    expect(valorDeVisita({ valor_mantencion: 20000 }, 25000)).toBe(20000);
    expect(valorDeVisita({ valor_mantencion: 0 }, 25000)).toBe(0);
  });

  it("cae al valor del cliente solo si la visita no trae precio", () => {
    expect(valorDeVisita({ valor_mantencion: null }, 25000)).toBe(25000);
    expect(valorDeVisita({}, 25000)).toBe(25000);
  });

  it("suma cada visita realizada a su propio precio, mas productos", () => {
    const total = totalCobrableDelMes(
      [
        { realizada: true, valor_mantencion: 20000, productos: [] },
        { realizada: true, valor_mantencion: 25000, productos: [cloro] },
        { realizada: false, valor_mantencion: 25000, productos: [cloro] },
        { realizada: true, productos: [] },
      ],
      30000,
    );
    expect(total).toBe(20000 + 25000 + 2000 + 2000 + 30000);
  });
});
