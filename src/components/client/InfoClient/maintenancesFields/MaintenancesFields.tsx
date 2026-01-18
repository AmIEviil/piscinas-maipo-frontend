import style from "./MaintenancesFields.module.css";
import CustomInputText from "../../../ui/InputText/CustomInputText";
import { useEffect, useState } from "react";
import { CustomSwitch } from "../../../ui/Switch/CustomSwitch";
import type { IMaintenanceCreate } from "../../../../service/maintenance.interface";
import type { IProducto } from "../../../../service/products.interface";
import CustomSelect from "../../../ui/Select/Select";
import AddIcon from "@mui/icons-material/Add";
import { CustomTextArea } from "../../../ui/InputText/CustonTextArea";
import TrashIcon from "../../../ui/Icons/TrashIcon";
import { Divider } from "@mui/material";
import Calendar from "../../../ui/datepicker/DatePicker";
import { getWindowWidth } from "../../../../utils/WindowUtils";
import MaintenanceFieldsMobile from "./MaintenancesFieldsMobile";

interface MaintenanceFieldsProps {
  clientId: string;
  valorMantencion: number;
  productosList: IProducto[];
  onAccept: (maintenance: IMaintenanceCreate) => void;
  onCancel?: () => void;
}

const MaintenanceFields = ({
  clientId,
  valorMantencion,
  productosList,
  onAccept,
  onCancel,
}: MaintenanceFieldsProps) => {
  const initial_maintenance = {
    fechaMantencion: new Date().toISOString().split("T")[0],
    realizada: false,
    recibioPago: false,
    valorMantencion: valorMantencion,
    client: { id: clientId },
    productosUsados: [] as { productId: string; cantidad: number }[],
    observaciones: "",
  };

  const [maintenance, setMaintenance] = useState(initial_maintenance);
  const [showProducts, setShowProducts] = useState(false);
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const productOptions = productosList
    .filter(
      (p): p is IProducto & { id: string } =>
        p.id !== undefined && p.id !== null,
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

    setMaintenance((prev) => ({
      ...prev,
      productosUsados: [...prev.productosUsados, newProduct],
    }));

    setSelectedProduct("");
    setCantidad(0);
  };

  const handleRemoveProduct = (index: number) => {
    setMaintenance((prev) => ({
      ...prev,
      productosUsados: prev.productosUsados.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={style.container}>
      <h3 className={style.title}>Nueva Mantención</h3>

      {windowWidth > 720 ? (
        <div className={style.formGrid}>
          {/* Sección Izquierda: Datos Generales */}
          <div className={style.sectionGeneral}>
            <div className="flex flex-row gap-4">
              <Calendar
                title="Fecha de Mantención"
                className="w-fit!"
                initialValue={new Date(maintenance.fechaMantencion)}
                required
                mode="day"
                onChange={({ start }) =>
                  setMaintenance({
                    ...maintenance,
                    fechaMantencion: start
                      ? start.toISOString().split("T")[0]
                      : maintenance.fechaMantencion,
                  })
                }
              />
              <div className={style.productsContainer}>
                <CustomSwitch
                  title="Agregar Productos"
                  checked={showProducts}
                  onChange={(checked) => setShowProducts(checked)}
                  required
                />
              </div>

              <div className={style.switchesContainer}>
                <CustomSwitch
                  title="¿Realizada?"
                  checked={maintenance.realizada}
                  onChange={(checked) =>
                    setMaintenance({ ...maintenance, realizada: checked })
                  }
                  required
                />
                <CustomSwitch
                  title="¿Pagada?"
                  checked={maintenance.recibioPago}
                  onChange={(checked) =>
                    setMaintenance({ ...maintenance, recibioPago: checked })
                  }
                  required
                />
              </div>
            </div>
            {showProducts && (
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
                  {maintenance.productosUsados.length > 0 ? (
                    maintenance.productosUsados.map((p, idx) => {
                      const producto = productosList?.find(
                        (prod) => prod.id === p.productId,
                      );
                      return (
                        <div
                          key={p.cantidad + idx}
                          className={style.productItem}
                        >
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
            )}
          </div>
          <div className={style.observationContainer}>
            <CustomTextArea
              title="Observaciones"
              placeholder="Detalles adicionales..."
              value={maintenance.observaciones}
              onChange={(value) =>
                setMaintenance({ ...maintenance, observaciones: value })
              }
            />
          </div>
        </div>
      ) : (
        <MaintenanceFieldsMobile
          clientId={clientId}
          valorMantencion={valorMantencion}
          productosList={productosList}
          value={maintenance}
          onChange={(updater) =>
            setMaintenance((prev) => ({
              ...prev,
              ...updater(prev),
            }))
          }
          onChangeProducts={(updater) =>
            setMaintenance((prev) => ({
              ...prev,
              productosUsados: updater(prev.productosUsados),
            }))
          }
        />
      )}
      <div className={style.footerButtons}>
        <button className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className={style.primaryButton}
          onClick={() => onAccept(maintenance)}
        >
          Guardar Mantención
        </button>
      </div>
    </div>
  );
};

export default MaintenanceFields;
