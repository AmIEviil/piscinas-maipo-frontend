import type {
  IProducto,
  IMetricsProduct,
  ITypeProduct,
  ICreateProductPayload,
  ICreateTypeProductPayload,
} from "../../service/productsInterface";
import { PRODUCTS_API } from "../api/products/api";
import apiClient from "../client/client";

export const productsService = {
  getProducts: async (): Promise<IProducto[]> => {
    const response = await apiClient.get(PRODUCTS_API.products);
    return response.data;
  },

  getAllTypesProducts: async (): Promise<ITypeProduct[]> => {
    const response = await apiClient.get(PRODUCTS_API.types);
    return response.data;
  },

  getProductsMetrics: async (): Promise<IMetricsProduct[]> => {
    const response = await apiClient.get(PRODUCTS_API.productsMetrics);
    return response.data;
  },

  createProduct: async (
    productData: ICreateProductPayload
  ): Promise<IProducto> => {
    const response = await apiClient.post(PRODUCTS_API.products, productData);
    return response.data;
  },

  createTypeProduct: async (
    typeProductData: ICreateTypeProductPayload
  ): Promise<ITypeProduct> => {
    const response = await apiClient.post(PRODUCTS_API.types, typeProductData);
    return response.data;
  },

  updateProduct: async (
    productId: number,
    productData: Partial<ICreateProductPayload>
  ): Promise<IProducto> => {
    const response = await apiClient.put(
      `${PRODUCTS_API.products}/${productId}`,
      productData
    );
    return response.data;
  },

  updateProductType: async (
    typeId: number,
    typeData: Partial<ICreateTypeProductPayload>
  ): Promise<ITypeProduct> => {
    const response = await apiClient.put(
      `${PRODUCTS_API.types}/${typeId}`,
      typeData
    );
    return response.data;
  },

  deleteProduct: async (productId: number): Promise<void> => {
    await apiClient.delete(`${PRODUCTS_API.products}/${productId}`);
  },

  deleteProductType: async (typeId: number): Promise<void> => {
    await apiClient.delete(`${PRODUCTS_API.types}/${typeId}`);
  },
};
