import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import type { IClientForm } from "../types";
import { useChangeFieldValue } from "../../../../utils/formUtils";
import { toUpperCaseFirstLetter, formatCLP } from "../../../../utils/formatTextUtils";
import {
  formatDateToDDMMYYYY,
  formatDateToLocalString,
} from "../../../../utils/DateUtils";
import Button from "../../../ui/button/Button";
import CustomCalendarV2 from "../../../ui/calendar/CustomCalendarV2";
import { useFrecuenciasMantencion } from "../../../../hooks/ClientHooks";
import style from "./ClientProfilePanel.module.css";
import campos from "../camposModal.module.css";

interface ClientProfilePanelProps {
  clientInfo: IClientForm;
  puedeEditar: boolean;
  onVerReparaciones: () => void;
  onActualizado: () => void;
}

/** Campos que se muestran, en el orden en que se muestran. */
const CAMPOS = [
  "nombre",
  "direccion",
  "comuna",
  "telefono",
  "email",
  "dia_mantencion",
  "frecuencia_mantencion",
  "valor_mantencion",
  "tipo_piscina",
  "ruta",
  "fecha_ingreso",
  "isActive",
];

/**
 * Rotulos que no se leen bien derivados del nombre del campo. El resto sale
 * de reemplazar guiones bajos por espacios.
 */
const ROTULOS: Record<string, string> = {
  frecuencia_mantencion: "Periodicidad de visitas",
  dia_mantencion: "Dia de mantencion",
  isActive: "Estado",
};

const rotuloDe = (clave: string) =>
  ROTULOS[clave] ?? toUpperCaseFirstLetter(clave.replace(/_/g, " "));

const mostrar = (clave: string, valor: unknown) => {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (clave === "isActive") return valor ? "Activo" : "Inactivo";
  if (clave.includes("valor")) return formatCLP(valor as number);
  if (clave.includes("fecha")) return formatDateToDDMMYYYY(valor as string);
  return String(valor);
};

/**
 * Valor guardado de `fecha_ingreso` como `Date` local, para CustomCalendarV2.
 *
 * Usa Luxon en vez de `new Date(...)` a proposito: una fecha "YYYY-MM-DD"
 * pasada a `new Date` se interpreta como UTC medianoche, y en un huso horario
 * detras de UTC (Chile) eso vuelve a mostrar el dia anterior -el mismo
 * desplazamiento que `DateUtils.formatDateToDDMMYYYY` ya documenta y evita
 * con `DateTime.fromISO`. `toJSDate()` sobre una fecha ya parseada en hora
 * local devuelve el dia correcto.
 */
const fechaParaCalendario = (valor: unknown): Date | undefined => {
  if (!valor) return undefined;
  const fecha =
    typeof valor === "string"
      ? DateTime.fromISO(valor)
      : DateTime.fromJSDate(valor as Date);
  return fecha.isValid ? fecha.startOf("day").toJSDate() : undefined;
};

/**
 * Ficha del cliente.
 *
 * La edicion pasa de estar escondida detras del hover de cada campo a un modo
 * explicito: se pulsa "Editar ficha", todos los campos se vuelven editables, y
 * se guarda o se cancela. En tablet no existe hover, y para el publico
 * objetivo una affordance oculta equivale a inexistente.
 */
const ClientProfilePanel = ({
  clientInfo,
  puedeEditar,
  onVerReparaciones,
  onActualizado,
}: ClientProfilePanelProps) => {
  const { data: frecuencias = [] } = useFrecuenciasMantencion();
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<IClientForm>(clientInfo);
  const { handleUpdate } = useChangeFieldValue(clientInfo.id?.value);

  useEffect(() => {
    setBorrador(clientInfo);
    setEditando(false);
  }, [clientInfo]);

  const camposVisibles = CAMPOS.filter(
    (clave) => clientInfo[clave] !== undefined,
  );

  const guardar = async () => {
    const cambios = camposVisibles
      .filter((clave) => borrador[clave]?.value !== clientInfo[clave]?.value)
      // La periodicidad se muestra por nombre pero se guarda por id: el campo
      // que el API acepta es la FK, no el texto.
      .map((clave) =>
        clave === "frecuencia_mantencion"
          ? {
              campo: "frecuencia_mantencion_id",
              valor: borrador.frecuencia_mantencion_id?.value,
            }
          : { campo: clave, valor: borrador[clave]?.value },
      );

    if (cambios.length > 0) {
      await handleUpdate(cambios);
      onActualizado();
    }
    setEditando(false);
  };

  return (
    <>
      <div className={style.barra}>
        <h3 className={style.titulo}>Datos del cliente</h3>
        <div className={style.barraAcciones}>
          <Button label="Ver reparaciones" variant="secondary" onClick={onVerReparaciones} />
          {puedeEditar && !editando && (
            <Button label="Editar ficha" variant="secondary" onClick={() => setEditando(true)} />
          )}
          {editando && (
            <>
              <Button
                label="Cancelar"
                variant="tertiary"
                onClick={() => {
                  setBorrador(clientInfo);
                  setEditando(false);
                }}
              />
              <Button label="Guardar cambios" variant="primary" onClick={guardar} />
            </>
          )}
        </div>
      </div>

      <div className={style.datos}>
        {camposVisibles.map((clave) => {
          // CustomCalendarV2 ya pinta su propio <label> asociado al campo con
          // aria-labelledby. Repetir el de afuera dejaria el rotulo dos veces
          // en pantalla y, peor, apuntando con htmlFor a un id inexistente
          // (el calendario no expone un <input> con `campo-${clave}`).
          const rotuloPropio = editando && clave === "fecha_ingreso";

          return (
          <div key={clave} className={style.dato}>
            {!rotuloPropio && (
              <label className={style.etiqueta} htmlFor={`campo-${clave}`}>
                {rotuloDe(clave)}
              </label>
            )}
            {editando && clave === "frecuencia_mantencion" ? (
              // Select y no <input> de texto: el valor viaja como uuid a una
              // FK, asi que escribirlo a mano solo puede terminar en un 500.
              // Se guardan las dos mitades a la vez -- el id para el API y el
              // nombre para que la comparacion de `guardar` detecte el cambio
              // y para que el campo se vea bien apenas se cierra la edicion.
              <select
                id={`campo-${clave}`}
                className={style.control}
                value={String(borrador.frecuencia_mantencion_id?.value ?? "")}
                onChange={(e) => {
                  const elegida = frecuencias.find(
                    (f) => f.id === e.target.value,
                  );
                  setBorrador((previo) => ({
                    ...previo,
                    frecuencia_mantencion_id: {
                      ...previo.frecuencia_mantencion_id,
                      key: "frecuencia_mantencion_id",
                      type: "string",
                      value: e.target.value,
                    },
                    frecuencia_mantencion: {
                      ...previo.frecuencia_mantencion,
                      key: "frecuencia_mantencion",
                      type: "string",
                      value: elegida?.nombre ?? "",
                    },
                  }));
                }}
              >
                <option value="">Sin definir</option>
                {frecuencias.map((frecuencia) => (
                  <option key={frecuencia.id} value={frecuencia.id}>
                    {frecuencia.nombre}
                  </option>
                ))}
              </select>
            ) : editando && clave === "isActive" ? (
              // Select en vez del <input> generico: el campo es booleano, y
              // el <input> de texto de mas abajo enviaria literalmente lo que
              // el usuario tipee ("si", "TRUE", " ") a un campo boolean del
              // API. El viejo ClientInfoFields nunca dejaba editar (ni ver)
              // este campo -- handleVisibleField descartaba todo boolean --
              // asi que no hay comportamiento previo que preservar aca, solo
              // uno nuevo que evitar romper.
              <select
                id={`campo-${clave}`}
                className={style.control}
                value={borrador[clave]?.value ? "true" : "false"}
                onChange={(e) =>
                  setBorrador((previo) => ({
                    ...previo,
                    [clave]: { ...previo[clave], value: e.target.value === "true" },
                  }))
                }
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            ) : editando && clave === "fecha_ingreso" ? (
              // Calendario en vez del <input> generico: el <input> de texto de
              // mas abajo mostraria el valor crudo guardado (ISO u otro) y
              // aceptaria cualquier texto, perdiendo el date picker que
              // UseRenderField.tsx ya daba para este mismo campo. Se guarda
              // "yyyy-MM-dd" armado desde las partes locales del Date
              // (formatDateToLocalString), nunca via toISOString(), que
              // convierte a UTC y corre el dia hacia atras en Chile.
              //
              // El <label> de arriba queda con htmlFor apuntando a un id que
              // ya no existe, asi que se oculta y el rotulo lo pone el propio
              // calendario, que si lo asocia a su campo con aria-labelledby.
              <CustomCalendarV2
                label={rotuloDe(clave)}
                placeholder="Elegir fecha..."
                initialDate={fechaParaCalendario(borrador[clave]?.value)}
                customClassName={campos.calendario}
                onSave={(fecha) =>
                  setBorrador((previo) => ({
                    ...previo,
                    [clave]: {
                      ...previo[clave],
                      value: fecha ? formatDateToLocalString(fecha) : "",
                    },
                  }))
                }
              />
            ) : editando ? (
              <input
                id={`campo-${clave}`}
                className={style.control}
                value={String(borrador[clave]?.value ?? "")}
                onChange={(e) =>
                  setBorrador((previo) => ({
                    ...previo,
                    [clave]: { ...previo[clave], value: e.target.value },
                  }))
                }
              />
            ) : (
              <span className={style.valor}>
                {mostrar(clave, clientInfo[clave]?.value)}
              </span>
            )}
          </div>
          );
        })}
      </div>
    </>
  );
};

export default ClientProfilePanel;
