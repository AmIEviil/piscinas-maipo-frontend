/**
 * Formato unico de dinero del modal de ficha del cliente: `$25.000`.
 *
 * Existia una formateadora por componente -`pesos` duplicada en
 * MonthStatusPanel y PaymentsPanel, un `Intl` en linea en PaymentCard, una
 * plantilla en linea en PaymentSheet, `formatoCLP` en MaintenanceSheet y
 * `formatMoneyNumber` en la cabecera-, y el mismo monto se pintaba distinto
 * segun donde se mirara.
 *
 * Se separa de `formatMoneyNumber` a proposito: aquella devuelve `""` para 0
 * y para `undefined`, comportamiento del que dependen vistas fuera del modal
 * (BodyClients, BodyInventory, InfoDialogProduct, revestimientos,
 * reparaciones, BoletaModalContainer). Aca 0 es un monto legitimo -"Pendiente
 * $0" tiene que leerse- y por eso se imprime.
 */
export const formatCLP = (value: number | null | undefined) =>
  `$${Math.round(Number(value ?? 0)).toLocaleString("es-CL")}`;

export const formatMoneyNumber = (value: number | undefined) => {
  if (!value) return "";
  return Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
};

export const toUpperCaseFirstLetter = (text: string) => {
  if (!text) return "";
  const normalizedText = text.toLowerCase().replace(/_/g, " ");
  return normalizedText.charAt(0).toUpperCase() + normalizedText.slice(1);
};

export const toPascalCaseMonth = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const formatName = (name: string) => {
  if (!name) return "";
  name = name.replace(/ /g, "_");
  return name;
};
