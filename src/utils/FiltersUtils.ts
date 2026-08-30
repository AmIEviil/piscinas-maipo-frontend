export const formatNoResultsText = (kind: string, filter: string): string => {
  switch (kind) {
    case "clients":
      return `No se encontraron clientes para el filtro: ${filter}`;
  }
  return "";
};

/** Un filtro aplicado, ya traducido a texto legible. */
export interface FiltroAplicado {
  etiqueta: string;
  valor: string;
}

/**
 * Mensaje de "sin resultados" que nombra todos los filtros aplicados.
 *
 * `formatNoResultsText` solo sabe mostrar uno, y desde que la busqueda
 * avanzada dejo la mitad de los filtros fuera de la barra ese mensaje se
 * volvia enganoso: el usuario veia "no se encontraron clientes" sin ninguna
 * pista de que el filtro que estaba vaciando el listado era uno que no tenia
 * a la vista.
 */
export const formatNoResultsFromFilters = (
  entidad: string,
  filtros: FiltroAplicado[],
): string => {
  if (filtros.length === 0) {
    return `Todavía no hay ${entidad} para mostrar.`;
  }

  const detalle = filtros
    .map((filtro) => `${filtro.etiqueta}: "${filtro.valor}"`)
    .join(" · ");

  return `No se encontraron ${entidad} con estos filtros — ${detalle}. Prueba quitar alguno o usa "Limpiar filtros".`;
};
