import { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import CustomSelect, {
  type IOptionsSelect,
} from "../../ui/Select/Select";
import Button from "../../ui/button/Button";
import { dias, rutas } from "../../../constant/constantBodyClient";
import type {
  BulkUpdateClientsResponse,
  CampoBulkCliente,
  Client,
  IFrecuenciaMantencion,
} from "../../../service/client.interface";
import { useBulkUpdateClients } from "../../../hooks/ClientHooks";
import style from "./BulkActions.module.css";

interface BulkEditClientsDialogProps {
  /** `null` mantiene el modal cerrado; el campo elegido lo abre. */
  campo: CampoBulkCliente | null;
  clientes: Client[];
  frecuencias: IFrecuenciaMantencion[];
  onClose: () => void;
  onAplicado: (resumen: BulkUpdateClientsResponse) => void;
}

const ETIQUETAS: Record<
  CampoBulkCliente,
  { titulo: string; etiquetaCampo: string; nombreCampo: string }
> = {
  dia_mantencion: {
    titulo: "Cambiar día de mantención",
    etiquetaCampo: "Nuevo día de mantención",
    nombreCampo: "el día de mantención",
  },
  ruta: {
    titulo: "Cambiar ruta",
    etiquetaCampo: "Nueva ruta",
    nombreCampo: "la ruta",
  },
  frecuencia_mantencion_id: {
    titulo: "Cambiar periodicidad de visitas",
    etiquetaCampo: "Nueva periodicidad de visitas",
    nombreCampo: "la periodicidad de visitas",
  },
};

const SIN_VALOR = "Sin asignar";

/**
 * Cambio masivo en dos pasos: primero se elige el valor nuevo y despues se
 * confirma.
 *
 * El segundo paso no es ceremonia: la accion toca decenas de fichas de una
 * vez y no hay "deshacer", asi que antes de escribir hay que mostrar en una
 * frase que cambia, de que a que y sobre cuantos clientes.
 */
export const BulkEditClientsDialog = ({
  campo,
  clientes,
  frecuencias,
  onClose,
  onAplicado,
}: BulkEditClientsDialogProps) => {
  const [valor, setValor] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const bulkUpdateMutation = useBulkUpdateClients();

  // Cada apertura arranca limpia: si no, al abrir "Cambiar ruta" despues de
  // "Cambiar día" quedaba seleccionado el valor del campo anterior.
  useEffect(() => {
    setValor("");
    setConfirmando(false);
    setError("");
  }, [campo]);

  const opciones = useMemo<IOptionsSelect[]>(() => {
    if (campo === "dia_mantencion") {
      // Se saca la opcion vacia del filtro: en el listado "Ninguno" significa
      // "no filtres por dia", pero como destino de un cambio masivo dejaria a
      // los clientes sin dia de visita.
      return dias.filter((dia) => dia.value !== "");
    }
    if (campo === "ruta") {
      return rutas.map((ruta) =>
        ruta.value === "" ? { value: "", label: "Sin ruta" } : ruta,
      );
    }
    if (campo === "frecuencia_mantencion_id") {
      return frecuencias.map((frecuencia) => ({
        value: frecuencia.id,
        label: frecuencia.nombre,
      }));
    }
    return [];
  }, [campo, frecuencias]);

  /** Etiqueta legible del valor elegido (el select guarda ids en frecuencia). */
  const etiquetaDestino = useMemo(() => {
    const opcion = opciones.find((item) => String(item.value) === valor);
    return opcion?.label ?? "";
  }, [opciones, valor]);

  /**
   * Valor actual de los clientes seleccionados.
   *
   * Si todos comparten el mismo se nombra ("de Martes a Jueves"); si no, la
   * frase lo dice en vez de inventar un origen unico.
   */
  const etiquetaOrigen = useMemo(() => {
    if (!campo || clientes.length === 0) return "";

    const valores = new Set(
      clientes.map((cliente) => {
        if (campo === "dia_mantencion") return cliente.dia_mantencion || SIN_VALOR;
        if (campo === "ruta") return cliente.ruta || "Sin ruta";
        return cliente.frecuencia_mantencion?.nombre || SIN_VALOR;
      }),
    );

    if (valores.size === 1) return [...valores][0];
    return `${valores.size} valores distintos`;
  }, [campo, clientes]);

  const abierto = campo !== null;
  const textos = campo ? ETIQUETAS[campo] : null;
  const cantidad = clientes.length;

  const handleContinuar = () => {
    if (!valor && campo !== "ruta") {
      setError("Elige un valor antes de continuar.");
      return;
    }
    setError("");
    setConfirmando(true);
  };

  const handleConfirmar = async () => {
    if (!campo) return;

    const ids = clientes
      .map((cliente) => cliente.id)
      .filter((id): id is string => Boolean(id));

    if (ids.length === 0) {
      setError("La selección no tiene clientes válidos.");
      return;
    }

    try {
      const resumen = await bulkUpdateMutation.mutateAsync({
        ids,
        campo,
        valor,
      });
      onAplicado(resumen);
    } catch {
      // El detalle ya se muestra en la snackbar de error del hook; aca solo
      // se deja el modal abierto para poder reintentar.
      setError("No se pudo aplicar el cambio. Inténtalo de nuevo.");
    }
  };

  const renderSeleccion = () => (
    <div className={style.cuerpo}>
      <p className={style.resumen}>
        El cambio se aplicará a{" "}
        <span className={style.destacado}>{cantidad} cliente(s)</span>{" "}
        seleccionado(s).
      </p>
      <CustomSelect
        title={textos?.etiquetaCampo}
        // El `label` de CustomSelect es el texto flotante de MUI: repetir ahi
        // el titulo lo dejaba escrito tres veces en el mismo campo.
        label="Selecciona una opción"
        options={opciones}
        value={valor}
        onChange={(evento) => {
          setValor(String(evento.target.value));
          setError("");
        }}
      />
      {error && <p className={style.error}>{error}</p>}
    </div>
  );

  const renderConfirmacion = () => (
    <div className={style.confirmacion}>
      <p>
        Se cambiará {textos?.nombreCampo} para{" "}
        <span className={style.destacado}>{cantidad} cliente(s)</span>:
      </p>
      <div className={style.cambio}>
        <span className={style.valorOrigen}>{etiquetaOrigen}</span>
        <span>a</span>
        <span className={style.valorDestino}>
          {etiquetaDestino || "Sin ruta"}
        </span>
      </div>
      <p className={style.destacado}>¿Estás seguro?</p>
      {campo === "dia_mantencion" && (
        <p className={style.aviso}>
          Las mantenciones futuras que aún no se realizan se moverán al nuevo
          día. Las ya realizadas no se tocan.
        </p>
      )}
      {error && <p className={style.error}>{error}</p>}
    </div>
  );

  return (
    <Modal
      centered
      show={abierto}
      onHide={onClose}
      enforceFocus={false}
      dialogClassName="max-h-[90dvh]"
    >
      <Modal.Header closeButton>
        {confirmando ? "Confirmar cambio" : textos?.titulo}
      </Modal.Header>
      <Modal.Body>
        {confirmando ? renderConfirmacion() : renderSeleccion()}
      </Modal.Body>
      <Modal.Footer>
        <Button
          label="Cancelar"
          variant="tertiary"
          onClick={confirmando ? () => setConfirmando(false) : onClose}
          disabled={bulkUpdateMutation.isPending}
        />
        <Button
          label={confirmando ? "Sí, confirmar cambio" : "Confirmar cambio"}
          variant="primary"
          onClick={confirmando ? handleConfirmar : handleContinuar}
          disabled={bulkUpdateMutation.isPending || cantidad === 0}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default BulkEditClientsDialog;
