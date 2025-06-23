import type { IMetricsProduct } from "../../service/productsInterface";
import { PRODUCTS_API } from "../api/products/api";
import apiClient from "../client/client";

export const productsService = {
  getProducts: async (): Promise<unknown> => {
    const response = await apiClient.get(PRODUCTS_API.products);
    return response.data;
  },

  getProductsMetrics: async (): Promise<IMetricsProduct[]> => {
    const response = await apiClient.get(PRODUCTS_API.productsMetrics);
    return response.data;
  },
};
