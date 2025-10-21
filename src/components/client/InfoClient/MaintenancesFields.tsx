import CustomInputText from "../../ui/InputText/CustomInputText";
import { useState } from "react";
import { CustomSwitch } from "../../ui/Switch/CustomSwitch";
import type { IMaintenanceCreate } from "../../../service/maintenanceInterface";
import type { IProducto } from "../../../service/productsInterface";
import CustomSelect from "../../ui/Select/Select";
import AddIcon from "@mui/icons-material/Add";

interface MaintenanceFieldsProps {
  clientId: number;
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
    fechaMantencion: "",
    realizada: false,
    recibioPago: false,
    valorMantencion: valorMantencion,
    client: { id: clientId },
    productosUsados: [] as { productId: number; cantidad: number }[],
  };

  const [maintenance, setMaintenance] = useState(initial_maintenance);
  const [showProducts, setShowProducts] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const productOptions = productosList
    .filter(
      (p): p is IProducto & { id: number } =>
        p.id !== undefined && p.id !== null
    )
    .map((product) => ({
      value: product.id.toString(),
      label: product.nombre,
    }));

  const handleAddProduct = () => {
    if (!selectedProduct) {
      setError("Debe seleccionar un producto");
      return;
    }
    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    setError("");

    const newProduct = {
      productId: Number(selectedProduct),
      cantidad: Number(cantidad),
    };

    setMaintenance((prev) => ({
      ...prev,
      productosUsados: [...prev.productosUsados, newProduct],
    }));

    // limpiar inputs
    setSelectedProduct("");
    setCantidad(0);
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-center mt-4 w-full flex-wrap">
      <div className="flex flex-row gap-4 flex-wrap justify-between w-full">
        <CustomInputText
          title="Fecha"
          type="date"
          value={maintenance.fechaMantencion}
          onChange={(value) =>
            setMaintenance({ ...maintenance, fechaMantencion: value })
          }
        />
        <CustomSwitch
          title="Realizada"
          checked={maintenance.realizada}
          onChange={(checked) =>
            setMaintenance({ ...maintenance, realizada: checked })
          }
          required
        />
        <CustomSwitch
          title="Pago"
          checked={maintenance.recibioPago}
          onChange={(checked) =>
            setMaintenance({ ...maintenance, recibioPago: checked })
          }
        />
        <CustomSwitch
          title="Se utilizaron productos"
          checked={showProducts}
          customClass="flex flex-col items-center justify-center"
          onChange={(checked) => setShowProducts(checked)}
        />

        {showProducts && (
          <div className="flex flex-col gap-2 w-full">
            <h3 className="font-semibold text-center">Productos utilizados</h3>

            {/* Lista de productos ya agregados */}
            {maintenance.productosUsados.length > 0 && (
              <div className="flex flex-col gap-1 mb-2">
                {maintenance.productosUsados.map((p, idx) => {
                  const producto = productosList?.find(
                    (prod) => prod.id === p.productId
                  );
                  return (
                    <div
                      key={idx}
                      className="flex flex-row justify-between bg-gray-100 p-2 rounded-md"
                    >
                      <span>{producto?.nombre ?? "Producto desconocido"}</span>
                      <span>x{p.cantidad}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Agregar nuevo producto */}
            <div className="flex flex-col gap-2 justify-center w-full">
              <CustomSelect
                label=""
                options={productOptions}
                value={selectedProduct}
                onChange={(event) =>
                  setSelectedProduct(String(event.target.value))
                }
              />
              <div className="flex flex-row gap-2 items-center justify-center">
                <CustomInputText
                  title="Cantidad"
                  type="number"
                  customClass="w-32!"
                  value={cantidad}
                  onChange={(value) => setCantidad(Number(value))}
                />
              </div>
              <button
                type="button"
                className="buttonInfo"
                onClick={handleAddProduct}
              >
                Agregar Producto
                <AddIcon fontSize="small" />
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-1 text-center">{error}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-row gap-2 mt-4">
        <button onClick={() => onAccept(maintenance)}>Aceptar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

export default MaintenanceFields;
