import { create } from "zustand";
import type { IProducto } from "../service/products.interface";

interface SolicitudProductosState {
  isModalOpen: boolean;
  /**
   * Nombre del producto a solicitar. Se llama typeProduct por historia: la
   * metrica de GET api/products/metrics expone el nombre del producto en el
   * campo `tipo`, y es ese texto ("Liquido", "Granulado", "Tableta", "Otros")
   * el que elige la plantilla del mensaje.
   */
  typeProduct: string;
  /**
   * Productos entre los que se puede elegir dentro del modal. Vacio cuando el
   * modal se abre desde una tarjeta del Home, que ya trae un producto fijo.
   */
  productosSolicitables: IProducto[];
  selectedProductId: string;
  setTypeProduct: (type: string) => void;
  setProductosSolicitables: (productos: IProducto[]) => void;
  setSelectedProductId: (id: string) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useSolicitudProductosStore = create<SolicitudProductosState>(
  (set) => ({
    isModalOpen: false,
    typeProduct: "",
    productosSolicitables: [],
    selectedProductId: "",
    setTypeProduct: (type) => set({ typeProduct: type }),
    setProductosSolicitables: (productos) =>
      set({ productosSolicitables: productos }),
    setSelectedProductId: (id) => set({ selectedProductId: id }),
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
  })
);
