import type { Field } from "../utils/formUtils";

/** Periodicidad de visitas: fila de `maintenance_temporality`. */
export interface IFrecuenciaMantencion {
  id: string;
  nombre: string;
}

export interface Client {
  id?: string;
  nombre: string;
  direccion: string;
  comuna: string;
  telefono: string;
  email?: string;
  dia_mantencion: string;
  tipo_piscina: string;
  fecha_ingreso?: Date;
  valor_mantencion: number;
  observacion?: string;
  isActive: boolean;
  ruta?: string;
  /** Solo lectura: viene del join del listado. Para escribir se usa el id. */
  frecuencia_mantencion?: IFrecuenciaMantencion;
  frecuencia_mantencion_id?: string;
}

/**
 * Campos que admiten cambio masivo desde el listado.
 *
 * La lista la impone el backend (`CAMPOS_BULK`): la edicion en bloque existe
 * para el cambio de temporada y para rearmar rutas, no para editar la ficha
 * completa de varios clientes a la vez.
 */
export type CampoBulkCliente =
  | "dia_mantencion"
  | "ruta"
  | "frecuencia_mantencion_id";

export interface BulkUpdateClientsPayload {
  ids: string[];
  campo: CampoBulkCliente;
  /** Siempre texto: el uuid de la periodicidad tambien viaja como cadena. */
  valor: string;
}

export interface BulkUpdateClientsResponse {
  clientesActualizados: number;
  campo: CampoBulkCliente;
  valor: string | null;
  mantencionesReprogramadas: number;
}

export interface ClientFilters {
  nombre?: string;
  direccion?: string;
  comuna?: string;
  dia?: string;
  ruta?: string;
  /** Id de la periodicidad, no su nombre. */
  frecuencia?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface IClientForm {
  id: Field<string>;
  nombre: Field<string>;
  direccion: Field<string>;
  comuna: Field<string>;
  telefono: Field<string>;
  email: Field<string>;
  fecha_ingreso: Field<Date | null>;
  tipo_piscina: Field<string>;
  dia_mantencion: Field<string>;
  ruta: Field<string>;
  valor_mantencion: Field<number>;
  /**
   * Nombre de la periodicidad ("Semanal"), no la relacion completa: el
   * backend la aplana en `findOne` porque los campos de la ficha se pintan
   * con String() y un objeto quedaba como "[object Object]".
   */
  frecuencia_mantencion: Field<string>;
  frecuencia_mantencion_id: Field<string>;
  isActive: Field<boolean>;
  observacion: Field<string>;
}
