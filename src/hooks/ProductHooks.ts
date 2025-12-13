import { useMutation } from "@tanstack/react-query";
import { productsService } from "../core/services/ProductsService";
import type {
  ICreateTypeProductPayload,
  ITypeProduct,
} from "../service/products.interface";
import { useRefetchStore } from "../store/refetchStore";
import { useSnackbar } from "../utils/snackBarHooks";

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
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const createProductMutation = useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Producto creado correctamente", "success");
    },
  });
  return createProductMutation;
};

export const useCreateTypeProduct = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const createTypeProductMutation = useMutation({
    mutationFn: productsService.createTypeProduct,
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Tipo de producto creado correctamente", "success");
    },
  });
  return createTypeProductMutation;
};

export const useUpdateProduct = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      productData,
    }: {
      productId: string;
      productData: Partial<ICreateTypeProductPayload>;
    }) => productsService.updateProduct(productId, productData),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Producto actualizado correctamente", "success");
    },
  });
  return updateProductMutation;
};

export const useUpdateProductType = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const updateProductTypeMutation = useMutation({
    mutationFn: ({
      typeId,
      typeData,
    }: {
      typeId: string;
      typeData: Partial<ITypeProduct>;
    }) => productsService.updateProductType(typeId, typeData),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Tipo de producto actualizado correctamente", "success");
    },
  });
  return updateProductTypeMutation;
};

export const useDeleteProduct = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productsService.deleteProduct(productId),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Producto actualizado correctamente", "success");
    },
  });
  return deleteProductMutation;
};

export const useDeleteProductType = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const deleteProductTypeMutation = useMutation({
    mutationFn: (typeId: string) => productsService.deleteProductType(typeId),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Tipo de producto eliminado correctamente", "success");
    },
  });
  return deleteProductTypeMutation;
};
