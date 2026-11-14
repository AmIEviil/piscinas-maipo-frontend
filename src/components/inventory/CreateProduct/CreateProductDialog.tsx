/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CategoryIcon from "@mui/icons-material/Category";
import type {
  ICreateProductPayload,
  ICreateTypeProductPayload,
  IProducto,
  ITypeProduct,
} from "../../../service/products.interface";
import {
  useCreateProduct,
  useCreateTypeProduct,
  useUpdateProduct,
  useUpdateProductType,
} from "../../../hooks/ProductHooks";
import Button from "../../ui/button/Button";
import FormSheet from "../../ui/formSheet/FormSheet";
import {
  FormField,
  FormInput,
  FormSection,
  FormSelect,
} from "../../ui/formSheet/FormFields";

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  productInfo?: IProducto;
  isEditMode?: boolean;
  kind?: string;
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
  const [stockMinimoProduct, setStockMinimoProduct] = useState<
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
        }).format(valorUnitarioProduct),
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
      stock_minimo: stockMinimoProduct != null ? stockMinimoProduct : null,
    };

    const productTypeToSubmit: ICreateTypeProductPayload = {
      nombre: nameProductType ?? "",
    };

    try {
      switch (kind) {
        case "product":
          if (isEditMode) {
            if (!productInfo?.id) return;
            await updateProduct.mutateAsync({
              productId: productInfo.id.toString(),
              productData: productToSubmit,
            });
          } else {
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
          } else {
            await createTypeProduct.mutateAsync(productTypeToSubmit);
          }
          break;
      }
      setSuccess(true);
      setLoading(false);
      handleClose();
    } catch (error) {
      console.error("Error creando producto:", error);
      setSuccess(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTipoProducto("");
    setSuccess(false);
    setStockMinimoProduct(undefined);
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
      setStockMinimoProduct(
        productInfo.stock_minimo != null ? productInfo.stock_minimo : undefined,
      );
      setInputValue(
        Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(productInfo.valor_unitario),
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
            <FormSection
              title="Producto"
              icon={<Inventory2Icon fontSize="inherit" />}
            >
              <FormField
                label="Nombre del producto"
                htmlFor="producto-nombre"
                required
                full
              >
                <FormInput
                  id="producto-nombre"
                  autoComplete="off"
                  value={nameProduct ?? ""}
                  onChange={(e) => handleName(e.target.value)}
                />
              </FormField>
              <FormField
                label="Tipo de producto"
                htmlFor="producto-tipo"
                full
              >
                <FormSelect
                  id="producto-tipo"
                  placeholder="Elegir tipo..."
                  options={typeOptions}
                  value={tipoProducto}
                  onChange={(e) => setTipoProducto(String(e.target.value))}
                />
              </FormField>
            </FormSection>

            <FormSection
              title="Stock y precio"
              icon={<MonetizationOnIcon fontSize="inherit" />}
            >
              <FormField
                label="Cantidad disponible"
                htmlFor="producto-cantidad"
                required
              >
                <FormInput
                  id="producto-cantidad"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  autoComplete="off"
                  value={cantidadDisponibleProduct ?? ""}
                  onChange={(e) =>
                    handleCantidadDisponible(Number(e.target.value))
                  }
                />
              </FormField>
              <FormField
                label="Valor unitario"
                htmlFor="producto-valor"
                required
              >
                <FormInput
                  id="producto-valor"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="$0"
                  value={inputValue}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() =>
                    setInputValue(
                      valorUnitarioProduct ? String(valorUnitarioProduct) : "",
                    )
                  }
                  onBlur={handleBlur}
                />
              </FormField>
              <FormField
                label="Alerta mínima de stock"
                htmlFor="producto-stock-minimo"
                hint="(opcional)"
                full
              >
                <FormInput
                  id="producto-stock-minimo"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  autoComplete="off"
                  value={stockMinimoProduct ?? ""}
                  onChange={(e) =>
                    setStockMinimoProduct(
                      e.target.value !== ""
                        ? Number(e.target.value)
                        : undefined,
                    )
                  }
                />
              </FormField>
            </FormSection>
          </>
        );

      case "type":
        return (
          <FormSection
            title="Tipo de producto"
            icon={<CategoryIcon fontSize="inherit" />}
          >
            <FormField
              label="Nombre del tipo"
              htmlFor="tipo-producto-nombre"
              required
              full
            >
              <FormInput
                id="tipo-producto-nombre"
                autoComplete="off"
                value={nameProductType ?? ""}
                onChange={(e) => setNameProductType(e.target.value)}
              />
            </FormField>
          </FormSection>
        );
    }
  };

  const esTipo = kind === "type";

  return (
    <FormSheet
      open={open}
      onClose={handleClose}
      title={`${isEditMode ? "Editar" : "Nuevo"} ${
        esTipo ? "tipo de producto" : "producto"
      }`}
      subtitle={
        isEditMode
          ? esTipo
            ? productInfo?.tipo?.nombre
            : productInfo?.nombre
          : "Los campos con * son obligatorios"
      }
      size="md"
      footer={
        <>
          <Button label="Cancelar" variant="tertiary" onClick={handleClose} />
          <Button
            onClick={handleAcceptButton}
            variant="primary"
            disabled={!isValidForm || loading}
            label={
              isEditMode
                ? "Guardar cambios"
                : esTipo
                  ? "Crear tipo"
                  : "Crear producto"
            }
            icon={success ? <CheckIcon /> : <SaveIcon />}
          />
        </>
      }
    >
      {renderBodyDialog()}
    </FormSheet>
  );
};

export default CreateProductDialog;
