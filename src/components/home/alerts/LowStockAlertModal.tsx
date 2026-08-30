import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { IProducto } from "../../../service/products.interface";

interface LowStockAlertModalProps {
  open: boolean;
  productos: IProducto[];
  onAceptar: () => void;
  onSolicitarProductos: () => void;
  onYaHayStock: () => void;
}

const ProductoRow = ({ producto }: { producto: IProducto }) => {
  const agotado = producto.cant_disponible <= 0;
  return (
    <li className="flex flex-row flex-wrap items-baseline justify-between gap-2 py-1 border-b border-gray-200 last:border-b-0">
      <span className="font-semibold">
        {producto.nombre}
        <span className="font-normal text-gray-500">
          {" "}
          ({producto.tipo?.nombre ?? "Sin tipo"})
        </span>
      </span>
      <span className={agotado ? "text-red-600 font-semibold" : "text-amber-600"}>
        {producto.cant_disponible} disponibles
        {producto.stock_minimo != null && ` / mínimo ${producto.stock_minimo}`}
      </span>
    </li>
  );
};

/**
 * Aviso de stock al entrar al Home. Separa los productos agotados de los que
 * solo estan bajo el minimo: los primeros no se van a poder usar al registrar
 * una mantencion, los segundos alcanzan para poco mas.
 */
const LowStockAlertModal = ({
  open,
  productos,
  onAceptar,
  onSolicitarProductos,
  onYaHayStock,
}: LowStockAlertModalProps) => {
  const agotados = productos.filter((producto) => producto.cant_disponible <= 0);
  const bajoMinimo = productos.filter(
    (producto) => producto.cant_disponible > 0,
  );

  return (
    <Dialog open={open} onClose={onAceptar} maxWidth="sm" fullWidth>
      <DialogTitle className="flex flex-row items-center gap-2">
        <WarningAmberIcon color="warning" />
        Productos sin stock disponible
      </DialogTitle>
      <DialogContent dividers>
        <p className="mb-3">
          Los siguientes productos no estarán disponibles al momento de
          registrar una mantención:
        </p>

        {agotados.length > 0 && (
          <div className="mb-3">
            <span className="font-semibold text-red-600">Sin stock</span>
            <ul className="mt-1 custom-scrollbar max-h-48 overflow-y-auto">
              {agotados.map((producto) => (
                <ProductoRow key={producto.id} producto={producto} />
              ))}
            </ul>
          </div>
        )}

        {bajoMinimo.length > 0 && (
          <div>
            <span className="font-semibold text-amber-600">
              Stock bajo el mínimo
            </span>
            <ul className="mt-1 custom-scrollbar max-h-48 overflow-y-auto">
              {bajoMinimo.map((producto) => (
                <ProductoRow key={producto.id} producto={producto} />
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
      <DialogActions className="flex flex-row flex-wrap gap-2">
        <Button onClick={onAceptar} color="inherit">
          Aceptar
        </Button>
        <Button onClick={onYaHayStock} color="success" variant="outlined">
          Ya hay stock
        </Button>
        <Button
          onClick={onSolicitarProductos}
          color="primary"
          variant="contained"
        >
          Solicitar Productos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LowStockAlertModal;
