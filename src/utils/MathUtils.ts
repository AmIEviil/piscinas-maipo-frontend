export const getArea = (length: number, width: number): number => {
  return length * width;
};

export const getVolume = (
  length: number,
  width: number,
  height: number
): number => {
  return length * width * height;
};

export const getAvgDepth = (minDepth: number, maxDepth: number): number => {
  return (minDepth + maxDepth) / 2;
};
