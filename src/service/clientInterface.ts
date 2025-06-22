export interface Client {
  id?: number;
  nombre: string;
  direccion: string;
  comuna: string;
  telefono: string;
  email?: string;
  dia_mantencion: string;
  tipo_piscina: string;
  fecha_ingreso?: Date;
  valor_mantencion: number;
}
