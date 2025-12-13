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
