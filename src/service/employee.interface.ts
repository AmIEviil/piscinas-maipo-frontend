export type FilterValue = string | boolean | null | number | (Date | null)[];

export interface FiltersEmployeesDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  grupo?: string;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface IEmployee {
  id?: string;
  nombre: string;
  apellido: string;
  rut: string;
  dv: string;
  email?: string;
  telefono: string;
  direccion: string;
  fechaInicioContrato: string;
  fechaTerminoContrato?: string;
  sueldo: number;
  tipoContrato: string;
  estado: string;
  grupo: string;
  notas?: string;
}

export interface IEmplooyeNotes {
  id?: string;
  empleadoId: string;
  descripcion: string;
  tipo: string;
  value?: string;
  fechaCreacion: string;
}
