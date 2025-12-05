import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CustomInputText from "../../ui/InputText/CustomInputText";
import style from "./CreateProductDialog.module.css";

import { useEffect, useRef, useState } from "react";
import { green } from "@mui/material/colors";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import type {
  ICreateProductPayload,
  ICreateTypeProductPayload,
  IProducto,
  ITypeProduct,
} from "../../../service/products.interface";
import CustomSelect from "../../ui/Select/Select";
import {
  useCreateProduct,
  useCreateTypeProduct,
  useUpdateProduct,
  useUpdateProductType,
} from "../../../hooks/ProductHooks";

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  productInfo?: IProducto;
  isEditMode?: boolean;
  kind?: "product" | "type";
  productTypes: ITypeProduct[];
}

const CreateProductDialog = ({
  open = false,
  onClose,
  productInfo,
  isEditMode,
  kind,
  productTypes,
}: CreateClientDialogProps) => {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const createTypeProduct = useCreateTypeProduct();
  const updateTypeProduct = useUpdateProductType();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [nameProductType, setNameProductType] = useState<string>();

  const [nameProduct, setNameProduct] = useState<string>();
  const [tipoProducto, setTipoProducto] = useState<string>("");
  const [cantidadDisponibleProduct, setCantidadDisponibleProduct] =
    useState<number>();
  const [valorUnitarioProduct, setValorUnitarioProduct] = useState<
    number | undefined
  >(undefined);

  const [inputValue, setInputValue] = useState<string>("");

  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const typeOptions = productTypes.map((type) => ({
    label: type.nombre,
    value: type.id,
  }));

  const handleName = (value: string) => {
    setNameProduct(value);
  };
  const handleCantidadDisponible = (value: number) => {
    setCantidadDisponibleProduct(value);
  };

  const handleChange = (value: string) => {
    const numeric = value.replace(/[^\d]/g, "");
    setInputValue(numeric);
    setValorUnitarioProduct(Number(numeric));
  };

  const handleBlur = () => {
    if (valorUnitarioProduct !== undefined && !isNaN(valorUnitarioProduct)) {
      setInputValue(
        Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(valorUnitarioProduct)
      );
    }
  };

  const handleAcceptButton = async () => {
    if (loading) return;

    setSuccess(false);
    setLoading(true);
    const productToSubmit: ICreateProductPayload = {
      nombre: nameProduct ?? "",
      cant_disponible: cantidadDisponibleProduct ?? 0,
      valor_unitario: valorUnitarioProduct ?? 0,
      tipo: (tipoProducto as string) ?? "",
    };

    const productTypeToSubmit: ICreateTypeProductPayload = {
      nombre: nameProductType ?? "",
    };

    try {
      switch (kind) {
        case "product":
          if (isEditMode) {
            if (!productInfo?.id) return;
            console.log("Editar producto:", productToSubmit);
            await updateProduct.mutateAsync({
              productId: productInfo.id,
              productData: productToSubmit,
            });
          } else {
            console.log("Crear producto:", productToSubmit);
            await createProduct.mutateAsync(productToSubmit);
          }
          break;
        case "type":
          if (isEditMode) {
            if (!productInfo?.tipo.id) return;
            await updateTypeProduct.mutateAsync({
              typeId: productInfo.tipo.id,
              typeData: productTypeToSubmit,
            });
            console.log("Editar tipo de producto:", productTypeToSubmit);
          } else {
            console.log("Crear tipo de producto:", productTypeToSubmit);
            await createTypeProduct.mutateAsync(productTypeToSubmit);
          }
          break;
      }
      setSuccess(true);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error creando producto:", error);
      setSuccess(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

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
      setTipoProducto(productInfo.tipo.id);
      setCantidadDisponibleProduct(productInfo.cant_disponible);
      setValorUnitarioProduct(productInfo.valor_unitario);
      setInputValue(
        Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(productInfo.valor_unitario)
      );
    }
  }, [productInfo, isEditMode]);

  useEffect(() => {
    if (
      kind === "product" &&
      nameProduct?.length &&
      cantidadDisponibleProduct &&
      valorUnitarioProduct
    ) {
      setIsValidForm(true);
    }
    if (kind === "type" && nameProductType?.length) {
      setIsValidForm(true);
    }
  }, [
    productInfo,
    isEditMode,
    nameProduct,
    cantidadDisponibleProduct,
    valorUnitarioProduct,
    nameProductType,
    kind,
  ]);

  const renderBodyDialog = () => {
    switch (kind) {
      case "product":
        return (
          <>
            <CustomInputText
              title="Nombre del Producto"
              require
              onChange={handleName}
              value={nameProduct}
            />
            <CustomSelect
              label="Tipo de Producto"
              options={typeOptions}
              onChange={(event) => setTipoProducto(String(event.target.value))}
              value={tipoProducto}
            />
            <CustomInputText
              title="Cantidad Disponible"
              require
              onChange={(value) => handleCantidadDisponible(Number(value))}
              value={cantidadDisponibleProduct}
            />
            <CustomInputText
              title="Valor Unitario"
              require
              onChange={handleChange}
              onBlur={handleBlur}
              value={inputValue}
            />
          </>
        );

      case "type":
        return (
          <>
            <h3>Tipo de Producto</h3>
            <CustomInputText
              title="Nombre del Tipo"
              require
              onChange={setNameProductType}
              value={nameProductType}
            />
          </>
        );
    }
  };

  const renderFooterDialog = () => {
    return (
      <DialogActions className={style.dialogActions}>
        <Fab
          aria-label="save"
          color="primary"
          sx={buttonSx}
          onClick={handleAcceptButton}
          disabled={!isValidForm || loading}
        >
          {success ? <CheckIcon /> : <SaveIcon />}
        </Fab>
        <button onClick={onClose}>Cancelar</button>
      </DialogActions>
    );
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle className={style.dialogTitle}>
        {isEditMode ? "Editar" : "Crear"}{" "}
        {kind === "product" ? "Producto" : "Tipo de Producto"}
      </DialogTitle>
      <DialogContent>
        <div className={style.formContainer}>{renderBodyDialog()}</div>
      </DialogContent>
      {renderFooterDialog()}
    </Dialog>
  );
};

export default CreateProductDialog;
