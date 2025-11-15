export const hasUpperCase = (str: string) => !(str === str.toLowerCase());

export const numbersInString = (str: string) => {
  return /\d+/.test(str);
};
