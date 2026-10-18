import { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Button from "../../ui/button/Button";
import type {
  BulkValorMantencionResponse,
  Client,
} from "../../../service/client.interface";
import { useBulkUpdateValorMantencion } from "../../../hooks/ClientHooks";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import {
  construirFilas,
  contarAjustesEnviados,
  errorDeFila,
  itemsAEnviar,
  parsearCantidad,
  totales,
  valorFinal,
  type FilaValor,
  type ModoAjuste,
} from "./valorMantencion.utils";
import style from "./BulkActions.module.css";

interface BulkValorMantencionDialogProps {
  abierto: boolean;
  clientes: Client[];
  onClose: () => void;
  onAplicado: (resumen: BulkValorMantencionResponse) => void;
}

const MODOS: Array<{ modo: ModoAjuste; label: string }> = [
  { modo: "monto", label: "Monto fijo" },
  { modo: "porcentaje", label: "Porcentaje" },
];

// formatMoneyNumber devuelve "" para 0; aca el 0 tiene que leerse.
const dinero = (valor: number) => formatMoneyNumber(valor) || "$0";

/**
 * Alza masiva del valor de mantencion en dos pasos: primero se define el
 * monto o porcentaje y se ajusta a mano lo que haga falta, despues se
 * confirma.
 *
 * Igual que el cambio masivo generico, el segundo paso existe porque la
 * accion toca muchas fichas a la vez; aca ademas el valor de cada cliente
 * puede quedar distinto al calculado, asi que la tabla es editable.
 */
export const BulkValorMantencionDialog = ({
  abierto,
  clientes,
  onClose,
  onAplicado,
}: BulkValorMantencionDialogProps) => {
  const [modo, setModo] = useState<ModoAjuste>("monto");
  const [texto, setTexto] = useState("");
  // Valor manual por cliente. `0` marca un texto tipeado que no es un monto
  // valido: asi la fila queda con error sin perder lo que la persona escribio.
  const [overrides, setOverrides] = useState<Record<string, number | null>>({});
  const [textoOverride, setTextoOverride] = useState<Record<string, string>>(
    {},
  );
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const mutation = useBulkUpdateValorMantencion();

  // Cada apertura arranca limpia, como en el cambio masivo generico.
  useEffect(() => {
    if (!abierto) return;
    setModo("monto");
    setTexto("");
    setOverrides({});
    setTextoOverride({});
    setConfirmando(false);
    setError("");
  }, [abierto]);

  const cantidad = useMemo(() => parsearCantidad(modo, texto), [modo, texto]);
  // Con el campo vacio no se muestra error: solo molestaria antes de escribir.
  const errorCantidad = texto.trim() !== "" ? cantidad.error : null;

  const filas = useMemo(
    () =>
      construirFilas(
        clientes
          .filter((cliente) => Boolean(cliente.id))
          .map((cliente) => ({
            id: cliente.id as string,
            nombre: cliente.nombre,
            valor_mantencion: cliente.valor_mantencion,
          })),
        modo,
        cantidad.valor,
        overrides,
      ),
    [clientes, modo, cantidad.valor, overrides],
  );

  const items = useMemo(() => itemsAEnviar(filas), [filas]);
  const suma = useMemo(() => totales(filas), [filas]);
  const manuales = contarAjustesEnviados(filas);
  const hayErrorFila = filas.some((fila) => errorDeFila(fila) !== null);
  const puedeContinuar = !cantidad.error && !hayErrorFila && items.length > 0;
  const sinCambios = !cantidad.error && !hayErrorFila && items.length === 0;

  const handleOverride = (id: string, valorTipeado: string) => {
    setTextoOverride((prev) => ({ ...prev, [id]: valorTipeado }));
    const parsed = parsearCantidad("monto", valorTipeado);
    setOverrides((prev) => ({ ...prev, [id]: parsed.valor ?? 0 }));
  };

  const handleRestaurar = (id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: null }));
    setTextoOverride((prev) => {
      const resto = { ...prev };
      delete resto[id];
      return resto;
    });
  };

  const handleConfirmar = async () => {
    try {
      const resumen = await mutation.mutateAsync({ items });
      onAplicado(resumen);
    } catch {
      // El detalle ya sale en la snackbar de error del hook; aca solo se deja
      // el modal abierto para reintentar.
      setError("No se pudo aplicar el cambio. Inténtalo de nuevo.");
    }
  };

  const renderTotales = () => (
    <p className={style.resumen}>
      {filas.length} cliente(s) · total mensual{" "}
      <span className={style.destacado}>{dinero(suma.actual)}</span> →{" "}
      <span className={style.destacado}>{dinero(suma.nuevo)}</span>
    </p>
  );

  const renderFila = (fila: FilaValor) => {
    const final = valorFinal(fila);
    // Sin cantidad valida y sin override la fila solo espera: el error ya
    // sale bajo el campo de cantidad.
    const errorFila =
      fila.override !== null || fila.calculado !== null
        ? errorDeFila(fila)
        : null;
    const diferencia = final !== null && !errorFila ? final - fila.actual : null;
    const valorInput =
      textoOverride[fila.id] ?? (final !== null ? String(final) : "");

    return (
      <tr
        key={fila.id}
        className={fila.override !== null ? style.filaAjustada : undefined}
      >
        <td>{fila.nombre}</td>
        <td>{dinero(fila.actual)}</td>
        <td>
          <div className={style.celdaNuevo}>
            <input
              type="text"
              inputMode="numeric"
              className={style.inputFila}
              value={valorInput}
              placeholder="—"
              aria-label={`Nuevo valor de ${fila.nombre}`}
              aria-invalid={errorFila !== null}
              onChange={(evento) => handleOverride(fila.id, evento.target.value)}
            />
            {fila.override !== null && (
              <button
                type="button"
                className={style.restaurar}
                onClick={() => handleRestaurar(fila.id)}
                aria-label={`Volver al calculado para ${fila.nombre}`}
                title="Volver al calculado"
              >
                <RestartAltIcon fontSize="small" />
              </button>
            )}
          </div>
          {errorFila && <p className={style.errorFila}>{errorFila}</p>}
        </td>
        <td
          className={
            diferencia !== null && diferencia < 0
              ? style.diferenciaNegativa
              : undefined
          }
        >
          {diferencia === null
            ? "—"
            : `${diferencia < 0 ? "-" : "+"}${dinero(Math.abs(diferencia))}`}
        </td>
      </tr>
    );
  };

  const renderEdicion = () => (
    <div className={style.cuerpo}>
      <div className={style.segmentado} role="group" aria-label="Tipo de alza">
        {MODOS.map((opcion) => (
          <button
            key={opcion.modo}
            type="button"
            className={style.segmento}
            aria-pressed={modo === opcion.modo}
            onClick={() => setModo(opcion.modo)}
          >
            {opcion.label}
          </button>
        ))}
      </div>

      <div>
        <div className={style.campoCantidad}>
          <span className={style.adorno}>{modo === "monto" ? "$" : "%"}</span>
          <input
            type="text"
            inputMode={modo === "monto" ? "numeric" : "decimal"}
            className={style.inputCantidad}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            aria-label={
              modo === "monto" ? "Monto a sumar" : "Porcentaje a sumar"
            }
            aria-invalid={Boolean(errorCantidad)}
          />
        </div>
        {errorCantidad && <p className={style.error}>{errorCantidad}</p>}
      </div>

      <div className={style.tablaScroll}>
        <table className={style.tabla}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Actual</th>
              <th>Nuevo</th>
              <th>Diferencia</th>
            </tr>
          </thead>
          <tbody>{filas.map(renderFila)}</tbody>
        </table>
      </div>

      {renderTotales()}
      {sinCambios && <p className={style.aviso}>No hay cambios para aplicar.</p>}
    </div>
  );

  const renderConfirmacion = () => (
    <div className={style.confirmacion}>
      <p>
        Se actualizará el valor de mantención de{" "}
        <span className={style.destacado}>{items.length}</span> cliente(s).
      </p>
      {renderTotales()}
      {manuales > 0 && <p>{manuales} con monto ajustado a mano.</p>}
      <p className={style.aviso}>
        Las mantenciones ya registradas conservan su valor; el nuevo valor rige
        desde la próxima mantención.
      </p>
      {error && <p className={style.error}>{error}</p>}
    </div>
  );

  return (
    <Modal
      centered
      scrollable
      size="lg"
      show={abierto}
      onHide={onClose}
      enforceFocus={false}
      dialogClassName="max-h-[90dvh]"
    >
      <Modal.Header closeButton>
        {confirmando ? "Confirmar cambio" : "Modificar valor mantención"}
      </Modal.Header>
      <Modal.Body>
        {confirmando ? renderConfirmacion() : renderEdicion()}
      </Modal.Body>
      <Modal.Footer>
        <Button
          label={confirmando ? "Volver" : "Cancelar"}
          variant="tertiary"
          onClick={confirmando ? () => setConfirmando(false) : onClose}
          disabled={mutation.isPending}
        />
        <Button
          label={confirmando ? "Sí, actualizar valores" : "Continuar"}
          variant="primary"
          onClick={
            confirmando
              ? handleConfirmar
              : () => {
                  setError("");
                  setConfirmando(true);
                }
          }
          disabled={mutation.isPending || (!confirmando && !puedeContinuar)}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default BulkValorMantencionDialog;
