import { useMutation } from "@tanstack/react-query";
import { productsService } from "../core/services/ProductsService";
import type {
  ICreateTypeProductPayload,
  ITypeProduct,
} from "../service/productsInterface";

export const useProducts = () => {
  const productMutation = useMutation({
    mutationFn: productsService.getProducts,
  });
  return productMutation;
};

export const useAllTypesProducts = () => {
  const allTypesProductsMutation = useMutation({
    mutationFn: productsService.getAllTypesProducts,
  });
  return allTypesProductsMutation;
};

export const useProductsMetrics = () => {
  const productMetricsMutation = useMutation({
    mutationFn: productsService.getProductsMetrics,
  });
  return productMetricsMutation;
};

export const useCreateProduct = () => {
  const createProductMutation = useMutation({
    mutationFn: productsService.createProduct,
  });
  return createProductMutation;
};

export const useCreateTypeProduct = () => {
  const createTypeProductMutation = useMutation({
    mutationFn: productsService.createTypeProduct,
  });
  return createTypeProductMutation;
};

export const useUpdateProduct = () => {
  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      productData,
    }: {
      productId: string;
      productData: Partial<ICreateTypeProductPayload>;
    }) => productsService.updateProduct(productId, productData),
  });
  return updateProductMutation;
};

export const useUpdateProductType = () => {
  const updateProductTypeMutation = useMutation({
    mutationFn: ({
      typeId,
      typeData,
    }: {
      typeId: string;
      typeData: Partial<ITypeProduct>;
    }) => productsService.updateProductType(typeId, typeData),
  });
  return updateProductTypeMutation;
};

export const useDeleteProduct = () => {
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productsService.deleteProduct(productId),
  });
  return deleteProductMutation;
};

export const useDeleteProductType = () => {
  const deleteProductTypeMutation = useMutation({
    mutationFn: (typeId: string) => productsService.deleteProductType(typeId),
  });
  return deleteProductTypeMutation;
};
