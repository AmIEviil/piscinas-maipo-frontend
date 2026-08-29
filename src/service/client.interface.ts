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
