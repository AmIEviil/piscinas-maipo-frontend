import { formatDateToDDMMYYYY } from "../../../../utils/DateUtils";
import { formatMoneyNumber } from "../../../../utils/formatTextUtils";
import CustomInputText from "../../../ui/InputText/CustomInputText";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FieldData {
  key: string;
  value: any; // Puede ser string, number, Date, boolean, o un objeto complejo
  type: string; // 'string' | 'number' | 'date' | 'boolean' | 'object'
}

interface ClientFieldRendererProps {
  fieldKey: string; // La clave del campo (ej: 'nombre')
  fieldData: { value: any; type: string }; // Los datos del campo
  isEditing?: boolean; // Si estamos en modo edición (opcional, para inputs)
  onChange?: (value: any) => void; // Callback para cambios (opcional)
  className?: string;
}

const ClientFieldRenderer = ({
  fieldKey,
  fieldData,
  isEditing = false,
  onChange,
  className = "",
}: ClientFieldRendererProps) => {
  // Helper para obtener un label legible (ej: "dia_mantencion" -> "Dia Mantencion")
  const getLabel = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderContent = () => {
    // Si estamos editando y es un string simple, mostramos Input (ejemplo para el título)
    if (isEditing && fieldData.type === "string") {
      return (
        <CustomInputText
          title={getLabel(fieldKey)}
          value={fieldData.value}
          onChange={(val) => onChange && onChange(val)}
        />
      );
    }

    switch (fieldData.type) {
      case "string":
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-semibold uppercase mb-1">
              {getLabel(fieldKey)}
            </span>
            <span className="text-base font-medium text-gray-800">
              {fieldData.value || "-"}
            </span>
          </div>
        );

      case "number": { // Detectar si es moneda por el nombre de la clave
        const isCurrency =
          fieldKey.includes("valor") ||
          fieldKey.includes("precio") ||
          fieldKey.includes("costo");
        const displayValue = isCurrency
          ? formatMoneyNumber(fieldData.value)
          : fieldData.value;

        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-semibold uppercase mb-1">
              {getLabel(fieldKey)}
            </span>
            <span className="text-base font-medium text-gray-800">
              {displayValue}
            </span>
          </div>
        );
      }

      case "date":
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-semibold uppercase mb-1">
              {getLabel(fieldKey)}
            </span>
            <span className="text-base font-medium text-gray-800">
              {fieldData.value
                ? formatDateToDDMMYYYY(new Date(fieldData.value))
                : "-"}
            </span>
          </div>
        );

      case "boolean":
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-semibold uppercase mb-1">
              {getLabel(fieldKey)}
            </span>
            <span
              className={`text-base font-bold ${
                fieldData.value ? "text-green-600" : "text-red-500"
              }`}
            >
              {fieldData.value ? "Activo" : "Inactivo"}
            </span>
          </div>
        );

      case "object": // Manejo específico para objetos como frecuencia_mantencion
      // Asumimos que si es objeto, queremos mostrar alguna propiedad 'nombre' o 'label' interna
      {
        const objectValue =
          fieldData.value?.nombre ||
          fieldData.value?.name ||
          JSON.stringify(fieldData.value);
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-semibold uppercase mb-1">
              {getLabel(fieldKey)}
            </span>
            <span className="text-base font-medium text-gray-800">
              {objectValue}
            </span>
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col">
            <span className="text-xs text-red-400 font-semibold uppercase mb-1">
              {getLabel(fieldKey)} (Desconocido)
            </span>
            <span className="text-sm text-gray-400">
              {String(fieldData.value)}
            </span>
          </div>
        );
    }
  };

  return (
    <div
      className={`p-2 rounded-lg bg-gray-50 border border-gray-100 ${className}`}
    >
      {renderContent()}
    </div>
  );
};

export default ClientFieldRenderer;
