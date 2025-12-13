import type { IOptionsSelect } from "../components/ui/Select/Select";
import { useUpdateClientField } from "../hooks/ClientHooks";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Field<T> {
  key: string;
  value: T;
  type: string;
}

export interface IFieldPayload {
  campo: string;
  valor: any;
}

export const handleWidthByInput = (val: string | number | null | undefined) => {
  const baseWidth = 25;
  const extraWidthPerChar = 1.5;
  return baseWidth + String(val).length * extraWidthPerChar;
};

export const useChangeFieldValue = (client_id: string) => {
  const updateCampoMutation = useUpdateClientField();
  const handleUpdate = (field: IFieldPayload[]) => {
    const formBody = {
      campos: field,
    };
    updateCampoMutation.mutateAsync({
      clientId: client_id,
      dto: formBody.campos,
    });
  };
  return { handleUpdate };
};

export const parseLabelsToValues = (
  labelString: string,
  options?: IOptionsSelect[]
) => {
  if (!labelString) return "";

  // Si options no existe, devolvemos tal cual (fallback)
  if (!options || options.length === 0) return labelString;

  // Ordenamos labels por longitud descendente para emparejar etiquetas más largas primero
  const opts = [...options].sort((a, b) => b.label.length - a.label.length);
  let remaining = labelString;
  const values: string[] = [];

  for (const opt of opts) {
    const idx = remaining.indexOf(opt.label);
    if (idx !== -1) {
      // encontramos la label, la añadimos y la removemos (primera ocurrencia)
      values.push(String(opt.value));
      remaining =
        remaining.slice(0, idx) + remaining.slice(idx + opt.label.length);
      // limpiamos separadores sobrantes
      remaining = remaining.replace(/,\s*/g, "").trim();
    }
  }

  // Si no encontramos nada: fallback si labelString ya es formato "0,1"
  if (values.length === 0 && /^[0-9,]+$/.test(labelString.replace(/\s/g, ""))) {
    return labelString.replace(/\s/g, "");
  }

  return values.join(",");
};

export const handleTypeOfField = (value: any): string => {
  if (typeof value === "string") {
    // Verificar si es fecha en formato ISO
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    const simpleDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (simpleDateRegex.test(value)) {
      return "date";
    }
    if (isoDateRegex.test(value)) {
      return "date";
    }
    return "string";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (value instanceof Date) {
    return "date";
  } else if (typeof value === "object") {
    return "object";
  } else {
    return "unknown";
  }
};
