import { describe, expect, it } from "vitest";
import {
  etiquetaCampo,
  formatearFechaHistorial,
  formatearValorHistorial,
} from "./historyFormat";

describe("historyFormat", () => {
  it("etiqueta campos conocidos y deja pasar los desconocidos", () => {
    expect(etiquetaCampo("valor_mantencion")).toBe("Valor mantención");
    expect(etiquetaCampo("isActive")).toBe("Estado");
    expect(etiquetaCampo("otro")).toBe("otro");
    expect(etiquetaCampo(null)).toBe("");
  });

  it("formatea valores segun el campo", () => {
    expect(formatearValorHistorial("isActive", "true")).toBe("Activo");
    expect(formatearValorHistorial("isActive", "false")).toBe("Inactivo");
    expect(formatearValorHistorial("fecha_ingreso", "2026-03-05")).toBe("05-03-2026");
    expect(formatearValorHistorial("valor_mantencion", "25000")).toMatch(/25\.000/);
    expect(formatearValorHistorial("nombre", null)).toBe("—");
    expect(formatearValorHistorial("nombre", "Ana")).toBe("Ana");
  });

  it("formatea la fecha en hora local", () => {
    const local = new Date(2026, 2, 5, 9, 7);
    expect(formatearFechaHistorial(local.toISOString())).toBe("05-03-2026 09:07");
  });
});
