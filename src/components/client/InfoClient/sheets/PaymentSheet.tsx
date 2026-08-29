import { useEffect, useMemo, useState } from "react";
import SlideSheet from "../../../ui/sheet/SlideSheet";
import Button from "../../../ui/button/Button";
import CustomInputText from "../../../ui/InputText/CustomInputText";
import CustomCalendarV2 from "../../../ui/calendar/CustomCalendarV2";
import { formatDateToLocalString } from "../../../../utils/DateUtils";
import { formatCLP } from "../../../../utils/formatTextUtils";
import style from "./PaymentSheet.module.css";
import campos from "../camposModal.module.css";

interface VisitaCubrible {
  id: string;
  etiqueta: string;
  monto: number;
}

interface PaymentSheetProps {
  abierta: boolean;
  encadenada: boolean;
  visitaFijada: VisitaCubrible | null;
  visitasSinPago: VisitaCubrible[];
  onCerrar: () => void;
  onGuardar: (datos: {
    monto: number;
    fecha_pago: string;
    comprobante?: File;
    mantencionIds: string[];
  }) => void;
}

/**
 * Fecha de hoy en `yyyy-MM-dd`, en hora local.
 *
 * Con `toISOString()` -que es lo que habia- la fecha se convierte a UTC
 * antes de recortarla: en Chile (UTC-3/-4) toda la tarde a partir de las
 * ~20:00 locales prefijaba el pago con la fecha de manana. Se usa el mismo
 * helper que ya emplea MaintenanceSheet para la fecha de la visita.
 */
const hoyISO = () => formatDateToLocalString(new Date());

/**
 * Registro de un pago.
 *
 * Se abre de dos formas: encadenada tras guardar una mantencion con pago
 * recibido, o directa desde la pestana Cobros. Encadenada trae la visita
 * recien creada marcada y bloqueada.
 */
const PaymentSheet = ({
  abierta,
  encadenada,
  visitaFijada,
  visitasSinPago,
  onCerrar,
  onGuardar,
}: PaymentSheetProps) => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [fechaPago, setFechaPago] = useState(hoyISO());
  const [monto, setMonto] = useState(0);
  const [comprobante, setComprobante] = useState<File | null>(null);
  // El usuario ya escribio un monto a mano: desde ese momento el monto
  // sugerido deja de pisarlo. Ver el efecto de mas abajo.
  const [montoEditado, setMontoEditado] = useState(false);

  // Al abrir se parte de cero, con la visita fijada ya marcada.
  useEffect(() => {
    if (!abierta) return;
    setSeleccionadas(visitaFijada ? [visitaFijada.id] : []);
    setFechaPago(hoyISO());
    setMonto(visitaFijada?.monto ?? 0);
    setComprobante(null);
    setMontoEditado(false);
  }, [abierta, visitaFijada]);

  /**
   * `fechaPago` vive como "YYYY-MM-DD" (es lo que se envia al API) y
   * CustomCalendarV2 trabaja con `Date`. Se agrega "T00:00:00" para forzar la
   * lectura en hora local: sin eso, `new Date("2026-08-28")` es medianoche
   * UTC y en Chile el calendario marcaria el dia anterior. Es el mismo
   * desplazamiento que `hoyISO` ya evita al escribir.
   */
  const fechaPagoDate = useMemo(() => {
    if (!fechaPago) return undefined;
    const fecha = new Date(`${fechaPago}T00:00:00`);
    return Number.isNaN(fecha.getTime()) ? undefined : fecha;
  }, [fechaPago]);

  const opciones = useMemo(
    () => (visitaFijada ? [visitaFijada, ...visitasSinPago] : visitasSinPago),
    [visitaFijada, visitasSinPago],
  );

  const alternar = (id: string) =>
    setSeleccionadas((previas) =>
      previas.includes(id) ? previas.filter((x) => x !== id) : [...previas, id],
    );

  // El monto sugerido acompana a lo seleccionado, pero solo mientras el
  // usuario no lo haya escrito el mismo.
  //
  // `opciones` deriva del memo `visitasSinPago` del padre, que devuelve un
  // arreglo nuevo en cada refetch: sin la guarda, este efecto se disparaba
  // tambien con cada refresco de datos del modal y borraba en silencio el
  // monto tipeado a mano -que es justo lo que se envia en el POST-. Con la
  // guarda, marcar y desmarcar visitas sigue actualizando un monto que
  // nadie toco, y un monto escrito a mano sobrevive.
  useEffect(() => {
    if (montoEditado) return;
    const sugerido = opciones
      .filter((o) => seleccionadas.includes(o.id))
      .reduce((suma, o) => suma + o.monto, 0);
    setMonto(sugerido);
  }, [seleccionadas, opciones, montoEditado]);

  return (
    <SlideSheet
      abierta={abierta}
      titulo="Registrar el pago"
      paso={encadenada ? "Paso 2 de 2" : undefined}
      onCerrar={onCerrar}
      pie={
        <>
          <Button
            label={encadenada ? "Omitir por ahora" : "Cancelar"}
            variant="tertiary"
            onClick={onCerrar}
          />
          <Button
            label="Guardar pago"
            variant="primary"
            disabled={monto <= 0 || !fechaPago}
            onClick={() =>
              onGuardar({
                monto,
                fecha_pago: fechaPago,
                comprobante: comprobante ?? undefined,
                mantencionIds: seleccionadas,
              })
            }
          />
        </>
      }
    >
      {encadenada && (
        <p className={style.confirmacion}>
          <span aria-hidden="true">✓</span> La mantencion quedo guardada.
        </p>
      )}

      {opciones.length > 0 && (
        <fieldset className={style.grupo}>
          <legend className={style.rotulo}>¿Que visitas cubre este pago?</legend>
          <div className={style.cubre}>
            {opciones.map((opcion) => {
              const fijada = opcion.id === visitaFijada?.id;
              return (
                <label key={opcion.id} className={style.cubreItem}>
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(opcion.id)}
                    disabled={fijada}
                    onChange={() => alternar(opcion.id)}
                  />
                  <span>
                    <span className={style.caja} aria-hidden="true">✓</span>
                    {opcion.etiqueta}
                    {fijada && <span className={style.nueva}>recien creada</span>}
                    <span className={style.montoOpcion}>
                      {formatCLP(opcion.monto)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className={style.pista}>
            Solo aparecen las visitas del mes que aun no tienen pago.
          </p>
        </fieldset>
      )}

      <div className={style.campo}>
        <CustomCalendarV2
          label="Fecha del pago"
          placeholder="Elegir fecha..."
          initialDate={fechaPagoDate}
          customClassName={campos.calendario}
          onSave={(fecha) =>
            setFechaPago(fecha ? formatDateToLocalString(fecha) : "")
          }
        />
      </div>

      <CustomInputText
        title="Monto recibido"
        type="text"
        value={monto ? formatCLP(monto) : ""}
        onChange={(valor) => {
          setMontoEditado(true);
          setMonto(Number(valor.replace(/[^\d]/g, "")));
        }}
        customClassContainer={campos.entrada}
      />

      <div className={style.campo}>
        <label htmlFor="pago-archivo">
          Comprobante <span className={style.pista}>(foto o PDF, opcional)</span>
        </label>
        <input
          className={style.control}
          id="pago-archivo"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
        />
      </div>
    </SlideSheet>
  );
};

export default PaymentSheet;
