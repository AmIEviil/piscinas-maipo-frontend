import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CustomInputText from "../../ui/InputText/CustomInputText";
import style from "./CreateProductDialog.module.css";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import PaidIcon from "@mui/icons-material/Paid";

import { useEffect, useRef, useState } from "react";
import { green } from "@mui/material/colors";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import type { IProducto } from "../../../service/productsInterface";

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  productInfo?: IProducto;
  isEditMode?: boolean;
}

const CreateProductDialog = ({
  open = false,
  onClose,
  productInfo,
  isEditMode,
}: CreateClientDialogProps) => {
  const [nameProduct, setNameProduct] = useState<string>();
  const [cantidadDisponibleProduct, setCantidadDisponibleProduct] =
    useState<number>();
  const [valorUnitarioProduct, setValorUnitarioProduct] = useState<number>();

  const handleName = (value: string) => {
    setNameProduct(value);
  };
  const handleCantidadDisponible = (value: number) => {
    setCantidadDisponibleProduct(value);
  };
  const handleValorUnitario = (value: number) => {
    setValorUnitarioProduct(value);
  };

  const handleButtonClick = async () => {
    if (loading) return;

    setSuccess(false);
    setLoading(true);
    const productToSubmit: IProducto = {
      nombre: nameProduct ?? "",
      cant_disponible: cantidadDisponibleProduct ?? 0,
      valor_unitario: valorUnitarioProduct ?? 0,
    };

    try {
      if (isEditMode) {
        if (!productInfo?.id) return;
        // await updateClientMutation.mutateAsync({
        //   clientId: productInfo.id,
        //   data: productToSubmit,
        // });
        console.log("Editar producto:", productToSubmit);
      } else {
        // await createClientMutation.mutateAsync(productToSubmit);
        console.log("Crear producto:", productToSubmit);
      }
      setSuccess(true);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error creando cliente:", error);
      setSuccess(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isValidForm =
    nameProduct?.length && cantidadDisponibleProduct && valorUnitarioProduct
      ? true
      : false;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (isEditMode && productInfo) {
      setNameProduct(productInfo.nombre);
    }
  }, [productInfo, isEditMode]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle className={style.dialogTitle}>
        Crear Nuevo Producto
      </DialogTitle>
      <DialogContent>
        <div className={style.formContainer}>
          <div className={style.fieldsContainer}>
            <div className={style.inputField}>
              <CustomInputText
                title="Nombre"
                icon={<PersonIcon />}
                require
                onChange={handleName}
                value={nameProduct}
              />
            </div>
            <div className={style.inputField}>
              <CustomInputText
                title="Cantidad Disponible"
                icon={<PhoneIcon />}
                onChange={(value) => handleCantidadDisponible(Number(value))}
                value={cantidadDisponibleProduct}
              />
            </div>
          </div>
          <div className={style.fieldsContainer}>
            <div className={style.inputField}>
              <CustomInputText
                title="Valor unitario"
                icon={<PaidIcon />}
                onChange={(value) => handleValorUnitario(Number(value))}
                value={formatMoneyNumber(valorUnitarioProduct)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className={style.dialogActions}>
        <Fab
          aria-label="save"
          color="primary"
          sx={buttonSx}
          onClick={handleButtonClick}
          disabled={!isValidForm || loading}
        >
          {success ? <CheckIcon /> : <SaveIcon />}
        </Fab>
        <button onClick={onClose}>Cancelar</button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProductDialog;
