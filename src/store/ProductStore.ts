import { create } from "zustand";
import type { IProducto } from "../service/productsInterface";
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
