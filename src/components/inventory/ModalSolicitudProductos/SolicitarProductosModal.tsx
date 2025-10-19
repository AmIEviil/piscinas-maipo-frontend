import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle } from "@mui/material";
import { useSolicitudProductosStore } from "../../../store/SolicitudProductosStore";
import CustomInputText from "../../ui/InputText/CustomInputText";
import { useEffect, useState } from "react";

interface SolicitarProductosModalProps {
  open: boolean;
  onClose: () => void;
}

const SolicitarProductosModal = ({
  open = false,
  onClose,
}: SolicitarProductosModalProps) => {
  const { typeProduct } = useSolicitudProductosStore();

  const [cantidad, setCantidad] = useState(0);
  const [mensaje, setMensaje] = useState("");

  const handleDefaultText = (cantidad: number) => {
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

    return "";
  };

  useEffect(() => {
    setMensaje(handleDefaultText(cantidad));
  }, [cantidad, typeProduct]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar {typeProduct}</DialogTitle>
      <DialogContent>
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
              onChange={(value) => setCantidad(Number(value))}
            />
            <span>
              Total estimado:{" "}
              {typeProduct === "Liquido"
                ? `${cantidad * 1500} CLP`
                : typeProduct === "Granulado"
                ? `${cantidad * 1000} CLP`
                : typeProduct === "Tableta"
                ? `${cantidad * 2000} CLP`
                : typeProduct === "Otros"
                ? `${cantidad * 500} CLP`
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
