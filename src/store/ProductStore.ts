import { create } from "zustand";
import type { IProducto, ITypeProduct } from "../service/products.interface";
import { productsService } from "../core/services/ProductsService";

interface ProductStore {
  products: IProducto[];
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  fetchProducts: async () => {
    const products = await productsService.getProducts();
    set({ products });
  },
}));

interface TypeProductStore {
  productsTypes: ITypeProduct[];
  fetchProductsTypes: () => Promise<void>;
}

export const useTypesProductStore = create<TypeProductStore>((set) => ({
  productsTypes: [],
  fetchProductsTypes: async () => {
    const productsTypes = await productsService.getAllTypesProducts();
    set({ productsTypes });
  },
}));
