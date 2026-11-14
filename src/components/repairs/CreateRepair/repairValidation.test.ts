import { describe, expect, it } from "vitest";
import { validarReparacion } from "./repairValidation";

const completa = {
  client_id: "c1",
  fecha_ingreso: "2026-11-14",
  fecha_trabajo: "2026-11-20",
  detalles: "Cambio de bomba",
  materiales: "Bomba 1HP",
  costo_reparacion: 0,
  valor_reparacion: 150000,
};

describe("validarReparacion", () => {
  it("acepta una reparacion completa, con costo 0", () => {
    expect(validarReparacion(completa)).toEqual({});
  });

  it("acepta el cliente que viene como relacion al editar", () => {
    const { client_id: _omitido, ...resto } = completa;
    void _omitido;
    expect(validarReparacion({ ...resto, client: { id: "c1" } as never })).toEqual({});
  });

  it("marca cada campo obligatorio faltante", () => {
    expect(Object.keys(validarReparacion({})).sort()).toEqual(
      [
        "cliente",
        "costo_reparacion",
        "detalles",
        "fecha_ingreso",
        "fecha_trabajo",
        "materiales",
        "valor_reparacion",
      ].sort(),
    );
  });

  it("rechaza texto solo con espacios y montos negativos", () => {
    const errores = validarReparacion({
      ...completa,
      detalles: "   ",
      valor_reparacion: -1,
    });
    expect(Object.keys(errores).sort()).toEqual(["detalles", "valor_reparacion"]);
  });
});
