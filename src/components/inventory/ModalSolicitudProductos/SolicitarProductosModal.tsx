/* eslint-disable react-hooks/exhaustive-deps */
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle } from "@mui/material";
import { useSolicitudProductosStore } from "../../../store/SolicitudProductosStore";
import CustomInputText from "../../ui/InputText/CustomInputText";
import CustomSelect from "../../ui/Select/Select";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import { useEffect, useState } from "react";

interface SolicitarProductosModalProps {
  open: boolean;
  onClose: () => void;
}

/** Precio referencial por unidad cuando el producto no viene del inventario. */
const PRECIOS_REFERENCIALES: Record<string, number> = {
  Liquido: 1500,
  Granulado: 1000,
  Tableta: 2000,
  Otros: 500,
};

const UNIDADES: Record<string, string> = {
  Liquido: "litros",
  Granulado: "kg",
  Tableta: "unidades",
  Otros: "unidades",
};

const SolicitarProductosModal = ({
  open = false,
  onClose,
}: SolicitarProductosModalProps) => {
  const {
    typeProduct,
    productosSolicitables,
    selectedProductId,
    setSelectedProductId,
    setTypeProduct,
  } = useSolicitudProductosStore();

  const [cantidad, setCantidad] = useState(0);
  const [mensaje, setMensaje] = useState("");

  // Solo hay que elegir producto cuando la alerta de stock bajo trajo varios.
  const conSelector = productosSolicitables.length > 0;
  const productoSeleccionado = productosSolicitables.find(
    (producto) => producto.id === selectedProductId,
  );

  const handleDefaultText = (cantidad: number) => {
    const unidad = UNIDADES[typeProduct] ?? "unidades";

    if (typeProduct === "Liquido") {
      return `Hola buenas, necesito solicitar cloro líquido. 
        Requiero ${cantidad} litros.
        Por favor, infórmenme sobre la disponibilidad y el precio. 
        Gracias.`;
    }

    if (typeProduct === "Granulado") {
      return `Hola buenas, necesito solicitar cloro granulado. 
        Requiero ${cantidad} kg.
        Por favor, infórmenme sobre la disponibilidad y el precio. 
        Gracias.`;
    }
    if (typeProduct === "Tableta") {
      return `Hola buenas, necesito solicitar tabletas de cloro. 
        Requiero ${cantidad} unidades.
        Por favor, infórmenme sobre la disponibilidad y el precio. 
        Gracias.`;
    }
    if (typeProduct === "Otros") {
      return `Hola buenas, necesito solicitar otros productos.
        Requiero ${cantidad} unidades.
        Por favor, infórmenme sobre la disponibilidad y el precio. 
        Gracias.`;
    }

    // Producto que no tiene plantilla propia (viene del inventario por nombre).
    if (typeProduct) {
      return `Hola buenas, necesito solicitar ${typeProduct}. 
        Requiero ${cantidad} ${unidad}.
        Por favor, infórmenme sobre la disponibilidad y el precio. 
        Gracias.`;
    }

    return "";
  };

  useEffect(() => {
    setMensaje(handleDefaultText(cantidad));
  }, [cantidad, typeProduct]);

  const handleChangeProducto = (id: string) => {
    const producto = productosSolicitables.find((item) => item.id === id);
    if (!producto) return;
    setSelectedProductId(id);
    setTypeProduct(producto.nombre);
  };

  const valorUnitario =
    productoSeleccionado?.valor_unitario ??
    PRECIOS_REFERENCIALES[typeProduct] ??
    0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar {typeProduct}</DialogTitle>
      <DialogContent>
        {conSelector && (
          <div className="pt-2">
            <CustomSelect
              label="Producto a solicitar"
              value={selectedProductId}
              options={productosSolicitables.map((producto) => ({
                value: producto.id ?? "",
                label: `${producto.nombre} (${producto.tipo?.nombre ?? "Sin tipo"}) - ${producto.cant_disponible} disponibles`,
              }))}
              onChange={(event) => handleChangeProducto(String(event.target.value))}
            />
          </div>
        )}
        <div className="flex flex-row gap-4 mt-2">
          <div className="pt-2 w-full">
            <textarea
              className="w-full h-32 p-2 border border-gray-300 rounded-md custom-scrollbar resize-none"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>
          <div>
            <CustomInputText
              title="Cantidad"
              type="number"
              value={cantidad}
              onChange={(value) => setCantidad(Number(value))}
            />
            <span>
              Total estimado:{" "}
              {valorUnitario > 0
                ? formatMoneyNumber(cantidad * valorUnitario)
                : ""}
            </span>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button onClick={onClose} color="primary" variant="contained">
          Enviar Solicitud
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SolicitarProductosModal;
