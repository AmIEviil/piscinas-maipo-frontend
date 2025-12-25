import { useState } from "react";
import style from "./MaintenancesFieldsMobile.module.css";
import type { IProducto } from "../../../../service/products.interface";
import type { IMaintenanceCreate } from "../../../../service/maintenance.interface";
import Calendar from "../../../ui/datepicker/DatePicker";
import { CustomSwitch } from "../../../ui/Switch/CustomSwitch";
import CustomSelect from "../../../ui/Select/Select";
import CustomInputText from "../../../ui/InputText/CustomInputText";
import { Divider } from "@mui/material";
import TrashIcon from "../../../ui/Icons/TrashIcon";
import AddIcon from "@mui/icons-material/Add";

interface Step {
  key: string;
  element?: React.ReactNode;
}

interface MaintenanceFieldsProps {
  clientId: string;
  value: Partial<IMaintenanceCreate>;
  valorMantencion: number;
  productosList: IProducto[];
  onChange: (
    updater: (prev: Partial<IMaintenanceCreate>) => Partial<IMaintenanceCreate>
  ) => void;
  onChangeProducts: (
    updater: (prev: { productId: string; cantidad: number }[]) => {
      productId: string;
      cantidad: number;
    }[]
  ) => void;
}

const MaintenanceFieldsMobile = ({
  // clientId,
  // valorMantencion,
  productosList,
  onChange,
  onChangeProducts,
  value: maintenance,
}: MaintenanceFieldsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const [showProducts, setShowProducts] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const productOptions = productosList
    .filter(
      (p): p is IProducto & { id: string } =>
        p.id !== undefined && p.id !== null
    )
    .map((product) => ({
      value: product.id.toString(),
      label: product.nombre,
    }));

  const handleAddProduct = () => {
    if (!selectedProduct) {
      setError("Selecciona un producto");
      return;
    }
    if (cantidad <= 0) {
      setError("Ingresa una cantidad válida");
      return;
    }

    setError("");

    // Verificar si ya existe para sumar cantidad (opcional, aquí solo agrega)
    const newProduct = {
      productId: String(selectedProduct),
      cantidad: Number(cantidad),
    };

    onChangeProducts((prev) => [...prev, newProduct]);

    setSelectedProduct("");
    setCantidad(0);
  };

  const handleRemoveProduct = (index: number) => {
    onChangeProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const steps: Step[][] = [
    [
      {
        key: "step1",
        element: (
          <>
            <Calendar
              title="Fecha de Mantención"
              initialValue={
                maintenance.fechaMantencion
                  ? new Date(maintenance.fechaMantencion)
                  : new Date()
              }
              required
              mode="day"
              onChange={({ start }) =>
                onChange((prev) => ({
                  ...prev,
                  fechaMantencion: start
                    ? start.toISOString().split("T")[0]
                    : prev.fechaMantencion,
                }))
              }
            />
          </>
        ),
      },
      {
        key: "step2",
        element: (
          <>
            <CustomSwitch
              title="¿Realizada?"
              checked={maintenance.realizada ? true : false}
              onChange={(checked) =>
                onChange((prev) => ({ ...prev, realizada: checked }))
              }
              required
            />
          </>
        ),
      },
      {
        key: "step3",
        element: (
          <>
            <CustomSwitch
              title="¿Pagada?"
              checked={maintenance.recibioPago ? true : false}
              onChange={(checked) =>
                onChange((prev) => ({ ...prev, recibioPago: checked }))
              }
              required
            />
          </>
        ),
      },
      {
        key: "step4",
        element: (
          <>
            <CustomSwitch
              title="Agregar Productos"
              checked={showProducts}
              onChange={(checked) => setShowProducts(checked)}
              required
            />
          </>
        ),
      },
    ],
    [
      {
        key: "step3",
        element: showProducts ? (
          <div className={style.sectionProducts}>
            {/* Formulario Agregar */}
            <h4 className={style.subtitle}>Productos Utilizados</h4>
            <div className={style.addProductForm}>
              <div className="grow">
                <CustomSelect
                  title="Seleccione un Producto"
                  required
                  label=""
                  options={productOptions}
                  value={selectedProduct}
                  onChange={(event) =>
                    setSelectedProduct(String(event.target.value))
                  }
                />
              </div>
              <div className="w-24">
                <CustomInputText
                  title="Cant."
                  type="number"
                  value={cantidad}
                  onChange={(value) => setCantidad(Number(value))}
                />
              </div>
              <button
                type="button"
                className={style.addButton}
                onClick={handleAddProduct}
                title="Agregar"
              >
                <AddIcon />
              </button>
            </div>
            {error && <span className={style.errorText}>{error}</span>}
            <Divider className="my-2" />
            {/* Lista de Productos */}
            <div className={`${style.productsList} custom-scrollbar`}>
              {(maintenance.productosUsados ?? []).length > 0 ? (
                (maintenance.productosUsados ?? []).map((p, idx) => {
                  const producto = productosList?.find(
                    (prod) => prod.id === p.productId
                  );
                  return (
                    <div key={idx} className={style.productItem}>
                      <span className="font-medium text-sm">
                        {producto?.nombre ?? "Desconocido"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm">
                          x{p.cantidad}
                        </span>
                        <button
                          className={style.deleteButton}
                          onClick={() => handleRemoveProduct(idx)}
                        >
                          <TrashIcon size={14} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={style.emptyState}>
                  No hay productos agregados aún.
                </div>
              )}
            </div>
          </div>
        ) : null,
      },
    ],
  ];
  const stepIndex = steps[activeTab];

  if (steps.length === 0) {
    return null;
  }
  return (
    <div className={style.revisionTabsContainer} key={activeTab}>
      <div className={style.maintenanceContainer}>
        {stepIndex.map((step) => (
          <div key={step.key} className={style.maintenanceField}>
            {step.element && (
              <div className="flex items-center justify-center">
                {step.element}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={style.revisionTabsHeader}>
        {steps.map((_, index) => (
          <button
            key={index}
            className={`normal ${style.revisionTabButton} ${
              activeTab === index ? style.active : ""
            }`}
            onClick={() => setActiveTab(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceFieldsMobile;
