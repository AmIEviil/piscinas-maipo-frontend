import type { Field } from "../utils/formUtils";

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
  observaciones?: string;
  isActive: boolean;
  ruta?: string;
}

export interface ClientFilters {
  nombre?: string;
  direccion?: string;
  comuna?: string;
  dia?: string;
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
  frecuencia_mantencion: {
    key: string;
    value: {
      id: string;
      nombre: string;
    };
    type: string;
  };
  isActive: Field<boolean>;
  observaciones: Field<string>;
}
