import Modal from "react-bootstrap/Modal";
import { useEffect, useRef } from "react";
//Icons
import { useProductStore } from "../../../store/ProductStore";
import type { IProducto } from "../../../service/products.interface";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import FieldGroup from "../../ui/labelField/FieldGroup";
import style from "./InfoDialogProduct.module.css";

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
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  const hasHistorial =
    productInfo?.historial && productInfo.historial.length > 0;

  return (
    <Modal show={open} onHide={handleClose} centered animation={false}>
      <div ref={modalRef}>
        <Modal.Header closeButton>
          <Modal.Title>{productInfo?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div>
            <FieldGroup
              label="Tipo de Producto"
              value={productInfo?.tipo.nombre || ""}
            />
            <FieldGroup
              label="Cantidad Disponible"
              value={productInfo?.cant_disponible || ""}
            />
            <FieldGroup
              label="Valor Unitario"
              value={formatMoneyNumber(productInfo?.valor_unitario) || ""}
              // editable={true}
              // type="number"
              // options={[]}
            />
          </div>
          {hasHistorial && (
            <div className={style.historialSection}>
              <p className={style.historialTitle}>Historial de Precios</p>
              {productInfo?.historial.map((history) => (
                <div key={history.id} style={{ marginBottom: "10px" }}>
                  <FieldGroup
                    label={`Cambio el ${new Date(
                      history.fecha_cambio
                    ).toLocaleDateString()}`}
                    value={`De ${formatMoneyNumber(
                      history.precio_anterior
                    )} a ${formatMoneyNumber(history.precio_nuevo)}`}
                  />
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default InfoProductDialog;
