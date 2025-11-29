export const formatNoResultsText = (kind: string, filter: string): string => {
  switch (kind) {
    case "clients":
      return `No se encontraron clientes para el filtro: ${filter}`;
  }
  return "";
};
