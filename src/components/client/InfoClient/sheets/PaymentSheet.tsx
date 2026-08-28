import { useEffect, useMemo, useState } from "react";
import SlideSheet from "./SlideSheet";
import Button from "../../../ui/button/Button";
import style from "./PaymentSheet.module.css";

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

const hoyISO = () => new Date().toISOString().split("T")[0];

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

  // Al abrir se parte de cero, con la visita fijada ya marcada.
  useEffect(() => {
    if (!abierta) return;
    setSeleccionadas(visitaFijada ? [visitaFijada.id] : []);
    setFechaPago(hoyISO());
    setMonto(visitaFijada?.monto ?? 0);
    setComprobante(null);
  }, [abierta, visitaFijada]);

  const opciones = useMemo(
    () => (visitaFijada ? [visitaFijada, ...visitasSinPago] : visitasSinPago),
    [visitaFijada, visitasSinPago],
  );

  const alternar = (id: string) =>
    setSeleccionadas((previas) =>
      previas.includes(id) ? previas.filter((x) => x !== id) : [...previas, id],
    );

  // El monto sugerido acompana a lo seleccionado, pero se puede sobrescribir.
  useEffect(() => {
    const sugerido = opciones
      .filter((o) => seleccionadas.includes(o.id))
      .reduce((suma, o) => suma + o.monto, 0);
    setMonto(sugerido);
  }, [seleccionadas, opciones]);

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
                      ${opcion.monto.toLocaleString("es-CL")}
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
        <label htmlFor="pago-fecha">Fecha del pago</label>
        <input
          className={style.control}
          id="pago-fecha"
          type="date"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
        />
      </div>

      <div className={style.campo}>
        <label htmlFor="pago-monto">Monto recibido</label>
        <input
          className={style.control}
          id="pago-monto"
          type="text"
          inputMode="numeric"
          value={monto ? `$${monto.toLocaleString("es-CL")}` : ""}
          onChange={(e) => setMonto(Number(e.target.value.replace(/[^\d]/g, "")))}
        />
      </div>

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
