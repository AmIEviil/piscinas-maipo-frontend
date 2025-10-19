import { useMutation } from "@tanstack/react-query";
import { productsService } from "../core/services/ProductsService";

export const useProducts = () => {
  const productMutation = useMutation({
    mutationFn: productsService.getProducts,
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  return productMutation;
};

export const useProductsMetrics = () => {
  const productMetricsMutation = useMutation({
    mutationFn: productsService.getProductsMetrics,
    // onError: (error: unknown) => {
    //   console.log(error);
    // },
    // onSuccess: (data) => {
    //   console.log(data);
    // },
  });
  return productMetricsMutation;
};
