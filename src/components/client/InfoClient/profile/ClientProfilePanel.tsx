import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import type { IClientForm } from "../types";
import { useChangeFieldValue } from "../../../../utils/formUtils";
import { toUpperCaseFirstLetter, formatMoneyNumber } from "../../../../utils/formatTextUtils";
import { formatDateToDDMMYYYY } from "../../../../utils/DateUtils";
import Button from "../../../ui/button/Button";
import style from "./ClientProfilePanel.module.css";

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
  "valor_mantencion",
  "tipo_piscina",
  "ruta",
  "fecha_ingreso",
  "isActive",
];

const mostrar = (clave: string, valor: unknown) => {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (clave === "isActive") return valor ? "Activo" : "Inactivo";
  if (clave.includes("valor")) return formatMoneyNumber(valor as number);
  if (clave.includes("fecha")) return formatDateToDDMMYYYY(valor as string);
  return String(valor);
};

/**
 * Valor de `fecha_ingreso` en el formato que exige `<input type="date">`
 * (`yyyy-MM-dd`). Usa Luxon en vez de `new Date(...).toISOString()` a
 * proposito: una fecha "YYYY-MM-DD" pasada a `new Date` se interpreta como
 * UTC medianoche, y en un huso horario detras de UTC (Chile) eso vuelve a
 * mostrar el dia anterior -el mismo desplazamiento que
 * `DateUtils.formatDateToDDMMYYYY` ya documenta y evita con
 * `DateTime.fromISO`.
 */
const fechaParaInput = (valor: unknown): string => {
  if (!valor) return "";
  const fecha =
    typeof valor === "string"
      ? DateTime.fromISO(valor)
      : DateTime.fromJSDate(valor as Date);
  return fecha.isValid ? fecha.toFormat("yyyy-MM-dd") : "";
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
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<IClientForm>(clientInfo);
  const { handleUpdate } = useChangeFieldValue(clientInfo.id?.value);

  useEffect(() => {
    setBorrador(clientInfo);
    setEditando(false);
  }, [clientInfo]);

  const campos = CAMPOS.filter((clave) => clientInfo[clave] !== undefined);

  const guardar = async () => {
    const cambios = campos
      .filter((clave) => borrador[clave]?.value !== clientInfo[clave]?.value)
      .map((clave) => ({ campo: clave, valor: borrador[clave]?.value }));

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
        {campos.map((clave) => (
          <div key={clave} className={style.dato}>
            <label className={style.etiqueta} htmlFor={`campo-${clave}`}>
              {toUpperCaseFirstLetter(clave.replace(/_/g, " "))}
            </label>
            {editando && clave === "isActive" ? (
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
              // Input de fecha en vez del <input> generico: el <input> de
              // texto de mas abajo mostraria el valor crudo guardado (ISO u
              // otro) y aceptaria cualquier texto, perdiendo el date picker
              // que UseRenderField.tsx ya daba para este mismo campo. El
              // input nativo entrega "yyyy-MM-dd" tal cual en su evento de
              // cambio: se guarda ese string directo, sin pasar por Date ni
              // por su desplazamiento de zona horaria.
              <input
                id={`campo-${clave}`}
                type="date"
                className={style.control}
                value={fechaParaInput(borrador[clave]?.value)}
                onChange={(e) =>
                  setBorrador((previo) => ({
                    ...previo,
                    [clave]: { ...previo[clave], value: e.target.value },
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
        ))}
      </div>
    </>
  );
};

export default ClientProfilePanel;
