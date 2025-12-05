import { useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
//Icons
import { useProductStore } from "../../../store/ProductStore";
import type { IProducto } from "../../../service/products.interface";

interface InfoProductDialogProps {
  open: boolean;
  productInfo?: IProducto;
  onClose: () => void;
}

const InfoProductDialog = ({
  open = false,
  productInfo,
  onClose,
}: InfoProductDialogProps) => {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog fullWidth={true} maxWidth={"xl"} open={open} onClose={handleClose}>
      <DialogContent style={{ borderRadius: 16 }}>
        <div>Info del Producto</div>
        <div>Nombre: {productInfo?.nombre}</div>
        <div>Cantidad Disponible: {productInfo?.cant_disponible}</div>
        <div>Valor Unitario: {productInfo?.valor_unitario}</div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoProductDialog;
