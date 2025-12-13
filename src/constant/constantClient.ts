export interface FormField {
  title: string;
  type: string;
  field: string;
}

export const formClient: FormField[] = [
  {
    title: "Nombre Cliente",
    type: "text",
    field: "nombre",
  },
  {
    title: "Dirección",
    type: "text",
    field: "direccion",
  },
  {
    title: "Comuna",
    type: "text",
    field: "comuna",
  },
  {
    title: "Teléfono",
    type: "text",
    field: "telefono",
  },
  {
    title: "Email",
    type: "text",
    field: "email",
  },
  {
    title: "Día de Mantención",
    type: "text",
    field: "dia_mantencion",
  },
  {
    title: "Tipo de Piscina",
    type: "text",
    field: "tipo_piscina",
  },
  {
    title: "Fecha de Ingreso",
    type: "date",
    field: "fecha_ingreso",
  },
  {
    title: "Valor de Mantención",
    type: "number",
    field: "valor_mantencion",
  },
  {
    title: "Observaciones",
    type: "text",
    field: "observaciones",
  },
  {
    title: "Ruta",
    type: "text",
    field: "ruta",
  },
  {
    title: "Activo",
    type: "checkbox",
    field: "isActive",
  },
];
