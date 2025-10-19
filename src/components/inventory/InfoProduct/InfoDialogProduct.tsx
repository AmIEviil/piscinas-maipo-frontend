import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { getWindowWidth } from "../../../utils/WindowUtils";
//Icons
import { useProductStore } from "../../../store/ProductStore";
import type { IProducto } from "../../../service/productsInterface";

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
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    console.log("Window width:", windowWidth);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
