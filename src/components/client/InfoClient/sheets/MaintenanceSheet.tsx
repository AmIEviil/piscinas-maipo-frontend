import { useEffect, useMemo, useState } from "react";
import SlideSheet from "../../../ui/sheet/SlideSheet";
import style from "./MaintenanceSheet.module.css";
import campos from "../camposModal.module.css";
import Button from "../../../ui/button/Button";
import CustomInputText from "../../../ui/InputText/CustomInputText";
import CustomCalendarV2 from "../../../ui/calendar/CustomCalendarV2";
import type {
  IMaintenance,
  IMaintenanceCreate,
  IMaintenanceUpdate,
  IProductosUtilizados,
} from "../../../../service/maintenance.interface";
import type { IProducto } from "../../../../service/products.interface";
import { formatDateToLocalString } from "../../../../utils/DateUtils";
import { formatCLP } from "../../../../utils/formatTextUtils";

interface MaintenanceSheetProps {
  abierta: boolean;
  clientId: string;
  valorMantencion: number;
  productosList: IProducto[];
  mantencionAEditar: IMaintenance | null;
  /**
   * Fecha "YYYY-MM-DD" con la que se abre una mantencion nueva. La pone la
   * linea de tiempo cuando se entra desde una visita proyectada; en null, la
   * hoja parte en el dia de hoy como siempre.
   */
  fechaSugerida?: string | null;
  /** true cuando el usuario puede encadenar el registro del pago. */
  puedeRegistrarPago: boolean;
  onCerrar: () => void;
  onGuardar: (
    datos: IMaintenanceCreate | IMaintenanceUpdate,
    registrarPago: boolean,
  ) => void;
}

const construirInicial = (
  clientId: string,
  valorMantencion: number,
  fechaSugerida?: string | null,
): IMaintenanceCreate => ({
  fechaMantencion: fechaSugerida ?? formatDateToLocalString(new Date()),
  realizada: false,
  recibioPago: false,
  valorMantencion,
  client: { id: clientId },
  productosUsados: [],
  observaciones: "",
});

/**
 * Hoja de registro/edicion de una mantencion, dentro de la SlideSheet
 * generica. Unifica MaintenancesFields.tsx (escritorio) y
 * MaintenancesFieldsMobile.tsx (celular) en una sola implementacion
 * responsive: el corte de layout entre ambos vive en el CSS via @container,
 * no en dos arboles de componentes distintos.
 */
const MaintenanceSheet = ({
  abierta,
  clientId,
  valorMantencion,
  productosList,
  mantencionAEditar,
  fechaSugerida,
  puedeRegistrarPago,
  onCerrar,
  onGuardar,
}: MaintenanceSheetProps) => {
  const [maintenance, setMaintenance] = useState<IMaintenanceCreate>(() =>
    construirInicial(clientId, valorMantencion, fechaSugerida),
  );
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Al abrir la hoja: si viene una mantencion a editar, carga sus datos (la
  // misma logica de MaintenancesFields.tsx lineas 60-81, sin cambios); si no,
  // parte de una mantencion en blanco. Corre en cada apertura, no solo en el
  // primer montaje, porque la hoja queda montada de forma permanente (la
  // visibilidad la maneja SlideSheet con CSS) en vez de montarse y
  // desmontarse como hacia el formulario viejo.
  useEffect(() => {
    if (!abierta) return;

    if (mantencionAEditar) {
      const productosFormateados =
        mantencionAEditar.productos?.map((p: IProductosUtilizados) => ({
          productId: p.product?.id?.toString() || p.id,
          cantidad: p.cantidad,
        })) || [];

      setMaintenance({
        fechaMantencion: new Date(mantencionAEditar.fechaMantencion)
          .toISOString()
          .split("T")[0],
        realizada: mantencionAEditar.realizada,
        recibioPago: mantencionAEditar.recibioPago,
        valorMantencion,
        client: { id: clientId },
        productosUsados: productosFormateados,
        observaciones: mantencionAEditar.observaciones || "",
      });
    } else {
      setMaintenance(construirInicial(clientId, valorMantencion, fechaSugerida));
    }

    setSelectedProduct("");
    setCantidad(0);
    setError("");
  }, [abierta, mantencionAEditar, clientId, valorMantencion, fechaSugerida]);

  const productOptions = productosList
    .filter(
      (p): p is IProducto & { id: string } =>
        p.id !== undefined && p.id !== null,
    )
    .map((product) => ({
      value: product.id.toString(),
      label: `${product.nombre} (${product.cant_disponible} disp.)`,
    }));

  const stockDisponible = productosList.find(
    (p) => String(p.id) === String(selectedProduct),
  )?.cant_disponible;

  // Validacion sin cambios respecto a handleAddProduct en
  // MaintenancesFields.tsx: producto elegido, cantidad mayor a cero, stock
  // suficiente, producto no repetido.
  const handleAddProduct = () => {
    if (!selectedProduct) {
      setError("Selecciona un producto");
      return;
    }
    if (cantidad <= 0) {
      setError("Ingresa una cantidad válida");
      return;
    }

    const producto = productosList.find((p) => p.id === selectedProduct);
    if (producto && producto.cant_disponible < cantidad) {
      setError(
        `Sin stock suficiente. Disponible: ${producto.cant_disponible}`,
      );
      return;
    }

    const yaAgregado = maintenance.productosUsados.some(
      (p) => p.productId === String(selectedProduct),
    );
    if (yaAgregado) {
      setError("Este producto ya fue agregado a la mantención");
      return;
    }

    setError("");

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

  const totalVisita = useMemo(() => {
    const productos = maintenance.productosUsados.reduce((suma, usado) => {
      const producto = productosList.find((p) => p.id === usado.productId);
      return suma + (producto?.valor_unitario ?? 0) * usado.cantidad;
    }, 0);
    return (maintenance.realizada ? valorMantencion : 0) + productos;
  }, [maintenance, productosList, valorMantencion]);

  /**
   * `fechaMantencion` se guarda como "YYYY-MM-DD" (es lo que espera el API),
   * pero CustomCalendarV2 trabaja con `Date`. La conversion agrega
   * "T00:00:00" a proposito: sin esa parte horaria, `new Date("2026-08-28")`
   * se interpreta como medianoche UTC y en Chile (UTC-3/-4) el calendario
   * marcaria el dia anterior.
   *
   * Se memoiza porque alimenta un prop que el calendario usa para derivar su
   * estado interno; un `Date` nuevo en cada render lo haria recalcular de mas.
   */
  const fechaVisita = useMemo(() => {
    if (!maintenance.fechaMantencion) return undefined;
    const fecha = new Date(`${maintenance.fechaMantencion}T00:00:00`);
    return Number.isNaN(fecha.getTime()) ? undefined : fecha;
  }, [maintenance.fechaMantencion]);

  // No hay nombre/direccion del cliente en las props de esta hoja: el
  // subtitulo se limita a la fecha de la visita en curso.
  const subtitulo = useMemo(() => {
    if (!fechaVisita) return undefined;
    return fechaVisita.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
    });
  }, [fechaVisita]);

  const encadena = maintenance.recibioPago && puedeRegistrarPago;

  return (
    <SlideSheet
      abierta={abierta}
      titulo={mantencionAEditar ? "Editar mantención" : "Registrar mantención"}
      subtitulo={subtitulo}
      paso={encadena ? "Paso 1 de 2" : undefined}
      onCerrar={onCerrar}
      pie={
        <>
          <Button label="Cancelar" variant="tertiary" onClick={onCerrar} />
          <Button
            label={
              encadena ? "Guardar y registrar el pago" : "Guardar mantención"
            }
            variant="primary"
            onClick={() => onGuardar(maintenance, encadena)}
            disabled={
              !maintenance.realizada &&
              maintenance.productosUsados.length === 0
            }
          />
        </>
      }
    >
      <div className={style.campo}>
        <CustomCalendarV2
          label="Fecha de la visita"
          placeholder="Elegir fecha..."
          initialDate={fechaVisita}
          customClassName={campos.calendario}
          onSave={(fecha) =>
            setMaintenance((prev) => ({
              ...prev,
              fechaMantencion: fecha ? formatDateToLocalString(fecha) : "",
            }))
          }
        />
      </div>

      <fieldset className={style.grupo}>
        <legend className={style.rotulo}>La mantención, ¿se realizó?</legend>
        <div className={style.opciones}>
          <label className={style.opcion}>
            <input
              type="radio"
              name="realizada"
              checked={maintenance.realizada}
              onChange={() =>
                setMaintenance((p) => ({ ...p, realizada: true }))
              }
            />
            <span>✓ Sí, se hizo</span>
          </label>
          <label className={`${style.opcion} ${style.opcionNo}`}>
            <input
              type="radio"
              name="realizada"
              checked={!maintenance.realizada}
              onChange={() =>
                setMaintenance((p) => ({ ...p, realizada: false }))
              }
            />
            <span>✕ No se hizo</span>
          </label>
        </div>
      </fieldset>

      <fieldset className={style.grupo}>
        <legend className={style.rotulo}>¿El cliente pagó esta visita?</legend>
        <div className={style.opciones}>
          <label className={style.opcion}>
            <input
              type="radio"
              name="recibioPago"
              checked={maintenance.recibioPago}
              onChange={() =>
                setMaintenance((p) => ({ ...p, recibioPago: true }))
              }
            />
            <span>✓ Sí, pagó</span>
          </label>
          <label className={`${style.opcion} ${style.opcionNo}`}>
            <input
              type="radio"
              name="recibioPago"
              checked={!maintenance.recibioPago}
              onChange={() =>
                setMaintenance((p) => ({ ...p, recibioPago: false }))
              }
            />
            <span>✕ Aún no</span>
          </label>
        </div>
        {encadena && (
          <p className={style.avisoEncadena}>
            Al guardar se abrirá el registro del pago para elegir qué visitas
            cubre y adjuntar el comprobante.
          </p>
        )}
      </fieldset>

      <div className={style.campo}>
        <span className={style.rotulo}>
          Productos utilizados <span className={style.pista}>(opcional)</span>
        </span>
        <div className={style.agregar}>
          <div className={style.campo}>
            <label htmlFor="mant-producto" className={style.pista}>
              Producto
            </label>
            <select
              className={style.control}
              id="mant-producto"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Elegir producto...</option>
              {productOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <CustomInputText
            title="Cantidad"
            type="number"
            showButtons
            min={0}
            max={stockDisponible}
            value={cantidad}
            onChange={(valor) => setCantidad(Number(valor))}
            customClassContainer={`${campos.entrada} ${campos.rotuloSuave}`}
          />
          <button
            type="button"
            className={style.agregarBtn}
            onClick={handleAddProduct}
          >
            Agregar producto
          </button>
        </div>
        {error && <span className={style.error}>{error}</span>}
        {maintenance.productosUsados.length > 0 && (
          <div className={style.elegidos}>
            {maintenance.productosUsados.map((p, idx) => {
              const producto = productosList.find(
                (prod) => prod.id === p.productId,
              );
              return (
                <div key={`${p.productId}-${idx}`} className={style.elegido}>
                  <span className={style.elegidoNombre}>
                    {producto?.nombre ?? "Desconocido"}
                  </span>
                  <span className={style.elegidoCantidad}>×{p.cantidad}</span>
                  <button
                    type="button"
                    className={style.elegidoQuitar}
                    onClick={() => handleRemoveProduct(idx)}
                    aria-label={`Quitar ${producto?.nombre ?? "producto"}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={style.campo}>
        <label htmlFor="mant-observaciones">
          Observaciones <span className={style.pista}>(opcional)</span>
        </label>
        <textarea
          className={style.control}
          id="mant-observaciones"
          placeholder="Ej: filtro con arena sucia, avisar al cliente"
          value={maintenance.observaciones}
          onChange={(e) =>
            setMaintenance((prev) => ({
              ...prev,
              observaciones: e.target.value,
            }))
          }
        />
      </div>

      <div className={style.totalHoja}>
        <span>Total de esta visita</span>
        <b>{formatCLP(totalVisita)}</b>
      </div>
    </SlideSheet>
  );
};

export default MaintenanceSheet;
