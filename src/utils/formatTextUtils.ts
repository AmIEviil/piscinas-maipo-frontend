export const formatMoneyNumber = (value: number | undefined) => {
  if (!value) return "";
  return Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
};

export const toUpperCaseFirstLetter = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};
