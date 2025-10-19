export const formatMoneyNumber = (value: number | undefined) => {
  if (!value) return "--";
  return Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
};
