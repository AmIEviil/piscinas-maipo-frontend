/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { tiposRevestimientos } from "../../../constant/constantBodyClient";
import { revestimientoService } from "../../../core/services/RevestimientoService";
import { formatDateToLocalString } from "../../../utils/DateUtils";
import Button from "../../ui/button/Button";
import {
  FormCell,
  FormDate,
  FormField,
  FormInput,
  FormSection,
  FormSearchSelect,
  FormSelect,
  FormTextarea,
} from "../../ui/formSheet/FormFields";
import style from "./RevestimientoFields.module.css";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import PoolIcon from "@mui/icons-material/Pool";
import ConstructionIcon from "@mui/icons-material/Construction";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import type { Client } from "../../../service/client.interface";
import type {
  IExtraRevestimientoCreate,
  IRevestimientoCreate,
} from "../../../service/revestimiento.interface";

interface RevestimientoFieldsProps {
  clients: Client[];
  value: Partial<IRevestimientoCreate>;
  onChange: (
    updater: (
      prev: Partial<IRevestimientoCreate>,
    ) => Partial<IRevestimientoCreate>,
  ) => void;
}

// "YYYY-MM-DD" (o ISO) a fecha local. new Date("YYYY-MM-DD") es medianoche
// UTC y en Chile mostraria el dia anterior.
const aFechaLocal = (valor?: string) => {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor ?? "");
  if (!partes) return undefined;
  const [, anio, mes, dia] = partes;
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
};

const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

// Atributos comunes de los campos numericos (medidas, precios)
const numerico = {
  type: "number",
  inputMode: "decimal",
  step: "any",
} as const;

const RevestimientoFields = ({
  clients,
  value,
  onChange,
}: RevestimientoFieldsProps) => {
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraValue, setNewExtraValue] = useState<number>(0);
  const [newExtraDetail, setNewExtraDetail] = useState("");

  const optionsClients = clients
    .filter(
      (c): c is Client & { id: string } => c.id !== undefined && c.id !== null,
    )
    .map((client) => ({
      value: client.id.toString(),
      label: client.nombre,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  // Area
  useEffect(() => {
    if (value.largoPiscina && value.anchoPiscina) {
      const area = value.largoPiscina * value.anchoPiscina;
      if (value.areaPiscina !== area) {
        onChange((prev) => ({ ...prev, areaPiscina: area }));
      }
    }
  }, [value.largoPiscina, value.anchoPiscina]);

  // Avg Depth
  useEffect(() => {
    if (value.profundidadMin && value.profundidadMax) {
      const avg = (value.profundidadMin + value.profundidadMax) / 2;
      if (value.profundidadAvg !== avg) {
        onChange((prev) => ({ ...prev, profundidadAvg: avg }));
      }
    }
  }, [value.profundidadMin, value.profundidadMax]);

  // Volume
  useEffect(() => {
    if (value.areaPiscina && value.profundidadAvg) {
      const vol = value.areaPiscina * value.profundidadAvg;
      if (value.volumenPiscina !== vol) {
        onChange((prev) => ({ ...prev, volumenPiscina: vol }));
      }
    }
  }, [value.areaPiscina, value.profundidadAvg]);

  // Costo Total
  useEffect(() => {
    if (
      value.costoManoObra !== undefined &&
      value.costoMateriales !== undefined &&
      value.valorM2 !== undefined &&
      value.areaPiscina !== undefined
    ) {
      const costoArea = value.valorM2 * value.areaPiscina;
      const costoTotal =
        costoArea + value.costoManoObra + value.costoMateriales;

      onChange((prev) => ({
        ...prev,
        costoTotal,
      }));
    }
  }, [
    value.costoManoObra,
    value.costoMateriales,
    value.valorM2,
    value.areaPiscina,
  ]);

  // Valor Total
  useEffect(() => {
    if (
      value.costoTotal !== undefined &&
      value.porcentajeGanancia !== undefined
    ) {
      let total = value.costoTotal * (1 + value.porcentajeGanancia / 100);

      if (value.extras && value.extras.length > 0) {
        const totalExtras = value.extras.reduce(
          (sum, extra) => sum + (Number(extra.valor) || 0),
          0,
        );
        total += totalExtras;
      }

      onChange((prev) => ({
        ...prev,
        valorTotal: total,
      }));
    }
  }, [value.costoTotal, value.porcentajeGanancia, value.extras]);

  const handleAddExtra = () => {
    if (!newExtraName || newExtraValue <= 0) return; // Validación básica

    const newExtra: IExtraRevestimientoCreate = {
      nombre: newExtraName,
      valor: newExtraValue,
      detalle: newExtraDetail,
    };

    onChange((prev) => ({
      ...prev,
      extras: [...(prev.extras || []), newExtra as IExtraRevestimientoCreate],
    }));

    // Resetear campos
    setNewExtraName("");
    setNewExtraValue(0);
    setNewExtraDetail("");
    setIsAddingExtra(false);
  };

  const handleRemoveExtra = (index: number) => {
    onChange((prev) => ({
      ...prev,
      extras: prev.extras?.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <FormSection
        title="Información general"
        icon={<PersonIcon fontSize="inherit" />}
      >
        <FormField
          label="Cliente"
          htmlFor="revestimiento-cliente"
          required
          full
        >
          <FormSearchSelect
            id="revestimiento-cliente"
            searchPlaceholder="Buscar cliente por nombre..."
            placeholder="Elegir cliente..."
            options={optionsClients}
            value={
              value.clienteId?.toString() || value.client?.id?.toString() || ""
            }
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({
                ...prev,
                clienteId: val ? String(val) : undefined,
              }));
            }}
          />
        </FormField>
        <FormDate
          full
          label="Fecha propuesta"
          placeholder="Elegir fecha"
          require
          initialDate={aFechaLocal(value.fechaPropuesta)}
          onSave={(fecha) =>
            onChange((prev) => ({
              ...prev,
              fechaPropuesta: fecha
                ? formatDateToLocalString(fecha)
                : prev.fechaPropuesta,
            }))
          }
        />
      </FormSection>

      <FormSection
        title="Dimensiones de la piscina"
        icon={<PoolIcon fontSize="inherit" />}
      >
        <FormField label="Largo (m)" htmlFor="rev-largo">
          <FormInput
            id="rev-largo"
            {...numerico}
            value={value.largoPiscina ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                largoPiscina: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField label="Ancho (m)" htmlFor="rev-ancho">
          <FormInput
            id="rev-ancho"
            {...numerico}
            value={value.anchoPiscina ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                anchoPiscina: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField label="Prof. mínima (m)" htmlFor="rev-prof-min">
          <FormInput
            id="rev-prof-min"
            {...numerico}
            value={value.profundidadMin ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                profundidadMin: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField label="Prof. máxima (m)" htmlFor="rev-prof-max">
          <FormInput
            id="rev-prof-max"
            {...numerico}
            value={value.profundidadMax ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                profundidadMax: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField
          label="Prof. promedio (m)"
          htmlFor="rev-prof-avg"
          hint="(calculado)"
        >
          <FormInput
            id="rev-prof-avg"
            className={style.calculado}
            readOnly
            tabIndex={-1}
            value={value.profundidadAvg?.toFixed(2) ?? ""}
          />
        </FormField>
        <FormField label="Área (m²)" htmlFor="rev-area" hint="(calculado)">
          <FormInput
            id="rev-area"
            className={style.calculado}
            readOnly
            tabIndex={-1}
            value={value.areaPiscina?.toFixed(2) ?? ""}
          />
        </FormField>
        <FormField
          label="Volumen (m³)"
          htmlFor="rev-volumen"
          hint="(calculado)"
          full
        >
          <FormInput
            id="rev-volumen"
            className={style.calculado}
            readOnly
            tabIndex={-1}
            value={value.volumenPiscina?.toFixed(2) ?? ""}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Costos y revestimiento"
        icon={<ConstructionIcon fontSize="inherit" />}
      >
        <FormField
          label="Tipo de revestimiento"
          htmlFor="rev-tipo"
          required
          full
        >
          <FormSelect
            id="rev-tipo"
            placeholder="Elegir tipo..."
            options={tiposRevestimientos}
            value={value.tipoRevestimiento || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                tipoRevestimiento: String(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField label="Valor m²" htmlFor="rev-valor-m2">
          <FormInput
            id="rev-valor-m2"
            {...numerico}
            placeholder="$0"
            value={value.valorM2 ?? ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, valorM2: Number(e.target.value) }))
            }
          />
        </FormField>
        <FormField label="Costo mano de obra" htmlFor="rev-mano-obra">
          <FormInput
            id="rev-mano-obra"
            {...numerico}
            placeholder="$0"
            value={value.costoManoObra ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                costoManoObra: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField label="Costo materiales" htmlFor="rev-materiales">
          <FormInput
            id="rev-materiales"
            {...numerico}
            placeholder="$0"
            value={value.costoMateriales ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                costoMateriales: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField label="% Ganancia" htmlFor="rev-ganancia">
          <FormInput
            id="rev-ganancia"
            {...numerico}
            placeholder="0"
            value={value.porcentajeGanancia ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                porcentajeGanancia: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <FormField
          label="Costo total"
          htmlFor="rev-costo-total"
          hint="(calculado)"
        >
          <FormInput
            id="rev-costo-total"
            className={style.calculado}
            readOnly
            tabIndex={-1}
            value={
              value.costoTotal !== undefined
                ? formatoCLP.format(value.costoTotal)
                : ""
            }
          />
        </FormField>
        <FormField
          label="Valor total (cliente)"
          htmlFor="rev-valor-total"
          hint="(calculado)"
        >
          <FormInput
            id="rev-valor-total"
            className={style.calculado}
            readOnly
            tabIndex={-1}
            value={formatoCLP.format(Math.round(value.valorTotal || 0))}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Detalles y fechas"
        icon={<DescriptionIcon fontSize="inherit" />}
      >
        <FormField
          label="Detalles / observaciones"
          htmlFor="rev-detalles"
          hint="(opcional)"
          full
        >
          <FormTextarea
            id="rev-detalles"
            value={value.detalles ?? ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, detalles: String(e.target.value) }))
            }
          />
        </FormField>
        <FormField label="Garantía" htmlFor="rev-garantia" full>
          <FormInput
            id="rev-garantia"
            placeholder="Ej: 2 años"
            value={value.garantia ?? ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, garantia: String(e.target.value) }))
            }
          />
        </FormField>
        <FormDate
          label="Fecha inicio obra"
          placeholder="Elegir fecha"
          require
          initialDate={aFechaLocal(value.fechaInicio)}
          onSave={(fecha) =>
            onChange((prev) => ({
              ...prev,
              fechaInicio: fecha
                ? formatDateToLocalString(fecha)
                : prev.fechaInicio,
            }))
          }
        />
        <FormDate
          label="Fecha término obra"
          placeholder="Elegir fecha"
          require
          initialDate={aFechaLocal(value.fechaTermino)}
          onSave={(fecha) =>
            onChange((prev) => ({
              ...prev,
              fechaTermino: fecha
                ? formatDateToLocalString(fecha)
                : prev.fechaTermino,
            }))
          }
        />
      </FormSection>

      <FormSection
        title="Imágenes del proyecto"
        icon={<ImageIcon fontSize="inherit" />}
      >
        <FormCell full>
          <label className={style.subir}>
            <CloudUploadIcon fontSize="small" />
            Subir imágenes
            <input
              className={style.inputOculto}
              type="file"
              multiple
              accept="image/*"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;
                const arr = Array.from(files);
                // Aquí podrías agregar un estado de carga si lo deseas
                const results = await Promise.all(
                  arr.map((f) => revestimientoService.uploadImagen(f)),
                );
                onChange((prev) => ({
                  ...prev,
                  imagenes: [...(prev.imagenes || []), ...results],
                }));
              }}
            />
          </label>
        </FormCell>
        <FormCell full>
          {value.imagenes && value.imagenes.length > 0 ? (
            <div className={style.galeria}>
              {value.imagenes.map((u, i) => (
                <div key={i} className={style.imagen}>
                  <img src={u.url} alt={`preview-${i}`} />
                  <button
                    className={style.quitarImagen}
                    type="button"
                    onClick={() => {
                      onChange((prev) => ({
                        ...prev,
                        imagenes: prev.imagenes?.filter((_, idx) => idx !== i),
                      }));
                    }}
                    title="Eliminar imagen"
                    aria-label="Eliminar imagen"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={style.vacio}>No hay imágenes seleccionadas</p>
          )}
        </FormCell>
      </FormSection>

      <FormSection title="Extras" icon={<LibraryAddIcon fontSize="inherit" />}>
        {/* Lista de extras agregados */}
        {value.extras && value.extras.length > 0 && (
          <FormCell full>
            <ul className={style.extras}>
              {value.extras.map((extra, index) => (
                <li key={index} className={style.extra}>
                  <div className={style.extraTexto}>
                    <span className={style.extraNombre}>{extra.nombre}</span>
                    {extra.detalle && (
                      <span className={style.extraDetalle}>
                        {extra.detalle}
                      </span>
                    )}
                  </div>
                  <span className={style.extraValor}>
                    ${extra.valor.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className={style.quitarExtra}
                    onClick={() => handleRemoveExtra(index)}
                    aria-label={`Quitar ${extra.nombre}`}
                  >
                    <DeleteIcon />
                  </button>
                </li>
              ))}
            </ul>
          </FormCell>
        )}

        {(!value.extras || value.extras.length === 0) && !isAddingExtra && (
          <FormCell full>
            <p className={style.vacio}>No hay extras agregados.</p>
          </FormCell>
        )}

        {/* Formulario para nuevo extra */}
        {isAddingExtra ? (
          <FormCell full>
            <div className={style.nuevoExtra}>
              <FormField label="Nombre del extra" htmlFor="rev-extra-nombre">
                <FormInput
                  id="rev-extra-nombre"
                  value={newExtraName}
                  onChange={(e) => setNewExtraName(String(e.target.value))}
                />
              </FormField>
              <FormField label="Valor ($)" htmlFor="rev-extra-valor">
                <FormInput
                  id="rev-extra-valor"
                  {...numerico}
                  placeholder="$0"
                  value={newExtraValue || ""}
                  onChange={(e) => setNewExtraValue(Number(e.target.value))}
                />
              </FormField>
              <FormField
                label="Detalle"
                htmlFor="rev-extra-detalle"
                hint="(opcional)"
              >
                <FormTextarea
                  id="rev-extra-detalle"
                  value={newExtraDetail}
                  onChange={(e) => setNewExtraDetail(String(e.target.value))}
                />
              </FormField>
              <div className={style.accionesExtra}>
                <Button
                  variant="tertiary"
                  label="Cerrar"
                  onClick={() => setIsAddingExtra(false)}
                />
                <Button
                  variant="primary"
                  label="Guardar extra"
                  icon={<CheckIcon fontSize="small" />}
                  onClick={handleAddExtra}
                  disabled={!newExtraName || newExtraValue <= 0}
                />
              </div>
            </div>
          </FormCell>
        ) : (
          <FormCell full>
            <Button
              variant="secondary"
              label="Agregar extra"
              icon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={() => setIsAddingExtra(true)}
            />
          </FormCell>
        )}
      </FormSection>
    </>
  );
};

export default RevestimientoFields;
