/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import type { Client } from "../../../service/clientInterface";
import CustomInputText from "../../ui/InputText/CustomInputText";
import CustomSelect from "../../ui/Select/Select";
import type { IRevestimientoCreate } from "../../../service/revestimientoInterface";
import DatePicker from "../../ui/calendar/DatePicker";
import dayjs from "dayjs";
import { tiposRevestimientos } from "../../../constant/constantBodyClient";
import { revestimientoService } from "../../../core/services/RevestimientoService";

interface RevestimientoFieldsProps {
  clients: Client[];
  value: Partial<IRevestimientoCreate>;
  onChange: (
    updater: (
      prev: Partial<IRevestimientoCreate>
    ) => Partial<IRevestimientoCreate>
  ) => void;
}

const RevestimientoFields = ({
  clients,
  value,
  onChange,
}: RevestimientoFieldsProps) => {
  const optionsClients = clients
    .filter(
      (c): c is Client & { id: number } => c.id !== undefined && c.id !== null
    )
    .map((client) => ({
      value: client.id.toString(),
      label: client.nombre,
    }));

  // Auto calculate fields
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
      const costoTotal =
        (value.costoManoObra + value.costoMateriales) *
        value.valorM2 *
        value.areaPiscina;
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
      const valorTotal =
        value.costoTotal * (1 + value.porcentajeGanancia / 100);

      onChange((prev) => ({
        ...prev,
        valorTotal,
      }));
    }
  }, [value.costoTotal, value.porcentajeGanancia]);

  return (
    <div className="flex flex-row flex-wrap gap-4">
      <div>
        <span>Información del General</span>
        <div className="flex flex-row flex-wrap gap-4">
          <CustomSelect
            title="Cliente"
            required
            label=""
            options={optionsClients}
            value={value.clienteId?.toString() || ""}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                clienteId: Number(event.target.value),
              }))
            }
          />
          <DatePicker
            label="Fecha Propuesta"
            required
            value={dayjs(value.fechaPropuesta)}
            onChange={(date) =>
              onChange((prev) => ({
                ...prev,
                fechaPropuesta: date ? date.toISOString() : "",
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span>Información de la Piscina</span>
        <div className="flex flex-row flex-wrap gap-4">
          <CustomInputText
            title="Largo"
            type="number"
            value={value.largoPiscina}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                largoPiscina: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Ancho"
            type="number"
            value={value.anchoPiscina}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                anchoPiscina: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Profundidad Minima"
            type="number"
            value={value.profundidadMin}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                profundidadMin: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Profundidad Maxima"
            type="number"
            value={value.profundidadMax}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                profundidadMax: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Profundidad Promedio"
            type="number"
            value={value.profundidadAvg}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                profundidadAvg: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Area"
            type="number"
            value={value.areaPiscina}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                areaPiscina: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Volumen"
            type="number"
            value={value.volumenPiscina}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                volumenPiscina: Number(value),
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span>Información del Revestimiento</span>
        <div className="flex flex-row flex-wrap gap-4">
          <CustomSelect
            title="Tipo de Revestimiento"
            required
            label=""
            options={tiposRevestimientos}
            value={value.tipoRevestimiento || ""}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                tipoRevestimiento: String(event.target.value),
              }))
            }
          />
          <CustomInputText
            title="Valor m²"
            type="number"
            value={value.valorM2}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                valorM2: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Costo Mano de Obra"
            type="number"
            value={value.costoManoObra}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                costoManoObra: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Costo Materiales"
            type="number"
            value={value.costoMateriales}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                costoMateriales: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Costo Total"
            type="number"
            value={value.costoTotal}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                costoTotal: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Porcentaje de Ganancia"
            type="number"
            value={value.porcentajeGanancia}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                porcentajeGanancia: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Valor Total"
            type="number"
            value={value.valorTotal}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                valorTotal: Number(value),
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span>Información Adicional</span>
        <div className="flex flex-row flex-wrap gap-4">
          <CustomInputText
            title="Detalles"
            value={value.detalles}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                detalles: String(value),
              }))
            }
          />
          <CustomInputText
            title="Garantía"
            value={value.garantia}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                garantia: String(value),
              }))
            }
          />
          <DatePicker
            label="Fecha Inicio Obra"
            required
            value={dayjs(value.fechaInicio)}
            onChange={(date) =>
              onChange((prev) => ({
                ...prev,
                fechaInicio: date ? date.toISOString() : "",
              }))
            }
          />
          <DatePicker
            label="Fecha Término Obra"
            required
            value={dayjs(value.fechaTermino)}
            onChange={(date) =>
              onChange((prev) => ({
                ...prev,
                fechaTermino: date ? date.toISOString() : "",
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span>Imágenes del Revestimiento</span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={async (e) => {
            const files = e.target.files;
            if (!files) return;
            const arr = Array.from(files);
            const results = await Promise.all(
              arr.map((f) => revestimientoService.uploadImagen(f))
            );
            onChange((prev) => ({
              ...prev,
              imagenes: [...(prev.imagenes || []), ...results],
            }));
          }}
        />

        {/* previsualizacion */}
        <div className="flex gap-2 mt-2">
          {value.imagenes?.map((u, i) => (
            <div key={i} className="relative">
              <img
                src={u.url}
                className="w-24 h-24 object-cover"
                alt={`img-${i}`}
              />
              <button
                onClick={() => {
                  onChange((prev) => ({
                    ...prev,
                    imagenes: prev.imagenes?.filter((x, idx) => idx !== i),
                  }));
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevestimientoFields;
