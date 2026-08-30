import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CustomInputText from "../../ui/InputText/CustomInputText";
import CustomSelect from "../../ui/Select/Select";
import TrashIcon from "../../ui/Icons/TrashIcon";
import type { IProducto } from "../../../service/products.interface";
import { useProducts, useUpdateProductsStock } from "../../../hooks/ProductHooks";

interface IngresoStockModalProps {
  open: boolean;
  /** Productos que traia la alerta; se precargan como filas del formulario. */
  productos: IProducto[];
  onClose: () => void;
  /**
   * Se llama despues de guardar. El cierre queda en manos del padre: asi
   * "Cancelar" puede volver a la alerta de stock y un guardado exitoso puede
   * seguir con la alerta siguiente.
   */
  onStockActualizado: () => void;
}

interface FilaIngreso {
  producto: IProducto;
  /** Se guarda como texto para poder dejar el campo vacio mientras se escribe. */
  recibido: string;
}

const toCantidad = (valor: string): number => {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return 0;
  return Math.floor(numero);
};

/**
 * Registra el stock que llego. La cantidad que se escribe es lo recibido y se
 * suma a lo que ya habia; el total resultante se muestra en la misma fila para
 * que no haya dudas de que no se esta reemplazando el valor.
 */
const IngresoStockModal = ({
  open,
  productos,
  onClose,
  onStockActualizado,
}: IngresoStockModalProps) => {
  const [filas, setFilas] = useState<FilaIngreso[]>([]);
  const [todosLosProductos, setTodosLosProductos] = useState<IProducto[]>([]);

  const productsMutation = useProducts();
  const updateStockMutation = useUpdateProductsStock();

  const productsRef = useRef(productsMutation.mutateAsync);
  productsRef.current = productsMutation.mutateAsync;

  useEffect(() => {
    if (!open) return;
    setFilas(productos.map((producto) => ({ producto, recibido: "" })));

    const cargarProductos = async () => {
      try {
        const data = await productsRef.current(undefined);
        setTodosLosProductos(data ?? []);
      } catch (error) {
        console.error("Error cargando el listado de productos:", error);
        setTodosLosProductos([]);
      }
    };
    cargarProductos();
  }, [open, productos]);

  const handleChangeRecibido = (productId: string, valor: string) => {
    setFilas((prev) =>
      prev.map((fila) =>
        fila.producto.id === productId ? { ...fila, recibido: valor } : fila,
      ),
    );
  };

  const handleQuitarFila = (productId: string) => {
    setFilas((prev) => prev.filter((fila) => fila.producto.id !== productId));
  };

  const handleAgregarProducto = (productId: string) => {
    const producto = todosLosProductos.find((item) => item.id === productId);
    if (!producto) return;
    setFilas((prev) =>
      prev.some((fila) => fila.producto.id === productId)
        ? prev
        : [...prev, { producto, recibido: "" }],
    );
  };

  const ingresos = filas
    .filter((fila) => fila.producto.id && toCantidad(fila.recibido) > 0)
    .map((fila) => ({
      productId: fila.producto.id as string,
      cantDisponible: fila.producto.cant_disponible + toCantidad(fila.recibido),
    }));

  const handleAceptar = async () => {
    if (ingresos.length === 0) return;
    try {
      await updateStockMutation.mutateAsync(ingresos);
      onStockActualizado();
    } catch (error) {
      console.error("Error actualizando el stock:", error);
    }
  };

  const opcionesDisponibles = todosLosProductos
    .filter((producto) => !filas.some((fila) => fila.producto.id === producto.id))
    .map((producto) => ({
      value: producto.id ?? "",
      label: `${producto.nombre} (${producto.tipo?.nombre ?? "Sin tipo"})`,
    }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex flex-row items-center gap-2">
        <Inventory2OutlinedIcon color="success" />
        Ingresar stock recibido
      </DialogTitle>
      <DialogContent dividers>
        <p className="mb-3">
          Indica cuánto llegó de cada producto. La cantidad se suma al stock
          actual.
        </p>

        <div className="flex flex-col gap-3 custom-scrollbar max-h-72 overflow-y-auto">
          {filas.length === 0 && (
            <span className="text-gray-500">
              No hay productos en la lista. Agrega uno más abajo.
            </span>
          )}
          {filas.map((fila) => {
            const recibido = toCantidad(fila.recibido);
            return (
              <div
                key={fila.producto.id}
                className="flex flex-row flex-wrap items-end gap-3 border-b border-gray-200 pb-2"
              >
                <div className="flex flex-col grow min-w-40">
                  <span className="font-semibold">{fila.producto.nombre}</span>
                  <span className="text-gray-500">
                    Stock actual: {fila.producto.cant_disponible}
                  </span>
                </div>
                <div className="w-32">
                  <CustomInputText
                    title="Recibido"
                    type="number"
                    min={0}
                    showButtons
                    value={fila.recibido}
                    onChange={(valor) =>
                      handleChangeRecibido(fila.producto.id ?? "", valor)
                    }
                  />
                </div>
                <span className="pb-2 whitespace-nowrap">
                  Total:{" "}
                  <strong>{fila.producto.cant_disponible + recibido}</strong>
                </span>
                <Tooltip title="Quitar de la lista" arrow leaveDelay={0}>
                  <button
                    type="button"
                    className="pb-2"
                    onClick={() => handleQuitarFila(fila.producto.id ?? "")}
                  >
                    <TrashIcon />
                  </button>
                </Tooltip>
              </div>
            );
          })}
        </div>

        {opcionesDisponibles.length > 0 && (
          <div className="pt-4">
            <CustomSelect
              label="Agregar otro producto"
              searchable
              value=""
              options={opcionesDisponibles}
              onChange={(event) =>
                handleAgregarProducto(String(event.target.value))
              }
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleAceptar}
          color="primary"
          variant="contained"
          disabled={ingresos.length === 0 || updateStockMutation.isPending}
          startIcon={
            updateStockMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngresoStockModal;
