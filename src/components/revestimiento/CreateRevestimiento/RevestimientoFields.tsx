/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import CustomInputText from "../../ui/InputText/CustomInputText";
import CustomSelect from "../../ui/Select/Select";
import DatePicker from "../../ui/calendar/DatePicker";
import dayjs from "dayjs";
import { tiposRevestimientos } from "../../../constant/constantBodyClient";
import { revestimientoService } from "../../../core/services/RevestimientoService";
import style from "./RevestimientoFields.module.css"; // Asegúrate de importar el nuevo CSS

// Icons (puedes ajustar las importaciones según tus iconos disponibles)
import PersonIcon from "@mui/icons-material/Person";
import PoolIcon from "@mui/icons-material/Pool";
import ConstructionIcon from "@mui/icons-material/Construction";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import type { Client } from "../../../service/client.interface";
import type {
  IExtraRevestimientoCreate,
  IRevestimientoCreate,
} from "../../../service/revestimiento.interface";
import { CustomTextArea } from "../../ui/InputText/CustonTextArea";

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
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraValue, setNewExtraValue] = useState<number>(0);
  const [newExtraDetail, setNewExtraDetail] = useState("");

  const optionsClients = clients
    .filter(
      (c): c is Client & { id: string } => c.id !== undefined && c.id !== null
    )
    .map((client) => ({
      value: client.id.toString(),
      label: client.nombre,
    }));

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
          0
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
    <div className={style.container}>
      {/* Sección 1: Información General */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Información General
        </h4>
        <div className={style.gridContainer}>
          <CustomSelect
            title="Cliente"
            required
            label=""
            options={optionsClients}
            value={
              value.clienteId?.toString() || value.client?.id?.toString() || ""
            }
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                clienteId: String(event.target.value),
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

      {/* Sección 2: Dimensiones de la Piscina */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <PoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Dimensiones de la Piscina
        </h4>
        <div className={style.gridContainer}>
          <CustomInputText
            title="Largo (m)"
            type="number"
            value={value.largoPiscina}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, largoPiscina: Number(val) }))
            }
          />
          <CustomInputText
            title="Ancho (m)"
            type="number"
            value={value.anchoPiscina}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, anchoPiscina: Number(val) }))
            }
          />
          <CustomInputText
            title="Prof. Mínima (m)"
            type="number"
            value={value.profundidadMin}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, profundidadMin: Number(val) }))
            }
          />
          <CustomInputText
            title="Prof. Máxima (m)"
            type="number"
            value={value.profundidadMax}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, profundidadMax: Number(val) }))
            }
          />
          <CustomInputText
            title="Prof. Promedio (m)"
            type="number"
            value={value.profundidadAvg?.toFixed(2)}
            onChange={() => {}}
          />
          <CustomInputText
            title="Área (m²)"
            type="number"
            value={value.areaPiscina?.toFixed(2)}
            onChange={() => {}}
          />
          <CustomInputText
            title="Volumen (m³)"
            type="number"
            value={value.volumenPiscina?.toFixed(2)}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Sección 3: Costos y Revestimiento */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <ConstructionIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Costos y Revestimiento
        </h4>
        <div className={style.gridContainer}>
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
            onChange={(val) =>
              onChange((prev) => ({ ...prev, valorM2: Number(val) }))
            }
          />
          <CustomInputText
            title="Costo Mano de Obra"
            type="number"
            value={value.costoManoObra}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, costoManoObra: Number(val) }))
            }
          />
          <CustomInputText
            title="Costo Materiales"
            type="number"
            value={value.costoMateriales}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, costoMateriales: Number(val) }))
            }
          />
          <CustomInputText
            title="Costo Total"
            type="number"
            value={value.costoTotal}
            onChange={() => {}}
          />
          <CustomInputText
            title="% Ganancia"
            type="number"
            value={value.porcentajeGanancia}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, porcentajeGanancia: Number(val) }))
            }
          />
          <CustomInputText
            title="Valor Total (Cliente)"
            type="number"
            value={Math.round(value.valorTotal || 0)}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Sección 4: Detalles Adicionales */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <DescriptionIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Detalles y Fechas
        </h4>
        <div className={style.gridContainer}>
          <div style={{ gridColumn: "1 / -1" }}>
            <CustomTextArea
              title="Detalles / Observaciones"
              value={value.detalles}
              onChange={(val) =>
                onChange((prev) => ({ ...prev, detalles: String(val) }))
              }
            />
          </div>
          <CustomInputText
            title="Garantía"
            value={value.garantia}
            onChange={(val) =>
              onChange((prev) => ({ ...prev, garantia: String(val) }))
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

      {/* Sección 5: Imágenes */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <ImageIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Imágenes del Proyecto
        </h4>
        <div className={style.imageUploadContainer}>
          <label className={style.fileInputLabel}>
            <CloudUploadIcon sx={{ mr: 1 }} />
            Subir Imágenes
            <input
              className={style.hiddenInput}
              type="file"
              multiple
              accept="image/*"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;
                const arr = Array.from(files);
                // Aquí podrías agregar un estado de carga si lo deseas
                const results = await Promise.all(
                  arr.map((f) => revestimientoService.uploadImagen(f))
                );
                onChange((prev) => ({
                  ...prev,
                  imagenes: [...(prev.imagenes || []), ...results],
                }));
              }}
            />
          </label>

          {/* Galería de Previsualización */}
          <div className={style.previewGrid}>
            {value.imagenes?.map((u, i) => (
              <div key={i} className={style.imageCard}>
                <img
                  src={u.url}
                  className={style.previewImage}
                  alt={`preview-${i}`}
                />
                <button
                  className={style.deleteButton}
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({
                      ...prev,
                      imagenes: prev.imagenes?.filter((_, idx) => idx !== i),
                    }));
                  }}
                  title="Eliminar imagen"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            ))}
            {(!value.imagenes || value.imagenes.length === 0) && (
              <span style={{ color: "#888", fontStyle: "italic" }}>
                No hay imágenes seleccionadas
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Sección 6: Extras */}

      <div className={style.section}>
        <div className="flex justify-between items-center border-b pb-2 mb-4 border-[#0289c7]">
          <h4 className="text-[1.1rem] font-semibold text-[#1a1a1a] m-0">
            <LibraryAddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Extras
          </h4>
          <button
            type="button"
            className={style.addExtraButton}
            onClick={() => setIsAddingExtra(!isAddingExtra)}
          >
            <AddCircleOutlineIcon sx={{ mr: 0.5 }} />
            {isAddingExtra ? "Cerrar" : "Agregar Extra"}
          </button>
        </div>

        {/* Lista de Extras Agregados */}
        {value.extras && value.extras.length > 0 && (
          <div className={style.extrasList}>
            {value.extras.map((extra, index) => (
              <div key={index} className={style.extraItem}>
                <div className="flex-1">
                  <span className="font-bold block">{extra.nombre}</span>
                  <span className="text-sm text-gray-600">{extra.detalle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#0289c7]">
                    ${extra.valor.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveExtra(index)}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para Nuevo Extra */}
        {isAddingExtra && (
          <div className={style.newExtraForm}>
            <div className={style.gridContainer}>
              <CustomInputText
                title="Nombre del Extra"
                value={newExtraName}
                onChange={(val) => setNewExtraName(String(val))}
              />
              <CustomInputText
                title="Valor ($)"
                type="number"
                value={newExtraValue}
                onChange={(val) => setNewExtraValue(Number(val))}
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <CustomTextArea
                  title="Detalle (Opcional)"
                  value={newExtraDetail}
                  onChange={(val) => setNewExtraDetail(String(val))}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className={style.saveExtraButton}
                onClick={handleAddExtra}
                disabled={!newExtraName || newExtraValue <= 0}
              >
                Guardar Extra
              </button>
            </div>
          </div>
        )}

        {(!value.extras || value.extras.length === 0) && !isAddingExtra && (
          <p className="text-gray-500 italic text-center py-4">
            No hay extras agregados.
          </p>
        )}
      </div>
    </div>
  );
};

export default RevestimientoFields;
