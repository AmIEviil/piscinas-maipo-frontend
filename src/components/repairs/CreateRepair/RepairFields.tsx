import type { Client } from "../../../service/client.interface";
import type { IRepairCreate } from "../../../service/repairs.interface";

import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

import {
  FormDate,
  FormField,
  FormInput,
  FormSection,
  FormSearchSelect,
  FormTextarea,
} from "../../ui/formSheet/FormFields";
import { formatDateToLocalString } from "../../../utils/DateUtils";
import type { CampoReparacion } from "./repairValidation";

interface RepairFieldsProps {
  clients: Client[];
  value: Partial<IRepairCreate>;
  onChange: (
    updater: (prev: Partial<IRepairCreate>) => Partial<IRepairCreate>,
  ) => void;
  /** Mensaje por campo; vacio hasta que se intenta guardar. */
  errores?: Partial<Record<CampoReparacion, string>>;
}

// "YYYY-MM-DD" a medianoche local, no UTC
const aFechaLocal = (fecha?: string) =>
  fecha ? new Date(`${fecha}T00:00:00`) : undefined;

const RepairFields = ({
  clients,
  value,
  onChange,
  errores = {},
}: RepairFieldsProps) => {
  // Orden alfabetico para el picker nativo
  const optionsClients = clients
    .filter(
      (c): c is Client & { id: string } => c.id !== undefined && c.id !== null,
    )
    .map((client) => ({
      value: client.id.toString(),
      label: client.nombre,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  return (
    <>
      <FormSection title="Cliente" icon={<PersonIcon fontSize="inherit" />}>
        <FormField
          label="Cliente"
          htmlFor="reparacion-cliente"
          required
          full
          error={errores.cliente}
        >
          <FormSearchSelect
            id="reparacion-cliente"
            searchPlaceholder="Buscar cliente por nombre..."
            placeholder="Elegir cliente..."
            options={optionsClients}
            value={
              value.client_id?.toString() || value.client?.id?.toString() || ""
            }
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({
                ...prev,
                client_id: val ? String(val) : undefined,
              }));
            }}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Fechas"
        icon={<CalendarMonthIcon fontSize="inherit" />}
      >
        <FormDate
          label="Fecha de ingreso"
          require
          error={errores.fecha_ingreso}
          initialDate={aFechaLocal(value.fecha_ingreso)}
          onSave={(fecha) =>
            onChange((prev) => ({
              ...prev,
              fecha_ingreso: fecha ? formatDateToLocalString(fecha) : "",
            }))
          }
        />
        <FormDate
          label="Fecha de trabajo"
          require
          error={errores.fecha_trabajo}
          initialDate={aFechaLocal(value.fecha_trabajo)}
          onSave={(fecha) =>
            onChange((prev) => ({
              ...prev,
              fecha_trabajo: fecha ? formatDateToLocalString(fecha) : "",
            }))
          }
        />
      </FormSection>

      <FormSection
        title="Detalles del trabajo"
        icon={<DescriptionIcon fontSize="inherit" />}
      >
        <FormField
          label="Detalles de la reparación"
          htmlFor="reparacion-detalles"
          required
          full
          error={errores.detalles}
        >
          <FormTextarea
            id="reparacion-detalles"
            placeholder="Qué se va a reparar..."
            value={value.detalles || ""}
            onChange={(e) => {
              const texto = e.target.value;
              onChange((prev) => ({ ...prev, detalles: texto }));
            }}
          />
        </FormField>
        <FormField
          label="Materiales a utilizar"
          htmlFor="reparacion-materiales"
          required
          full
          error={errores.materiales}
        >
          <FormTextarea
            id="reparacion-materiales"
            value={value.materiales || ""}
            onChange={(e) => {
              const texto = e.target.value;
              onChange((prev) => ({ ...prev, materiales: texto }));
            }}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Costos y garantía"
        icon={<MonetizationOnIcon fontSize="inherit" />}
      >
        <FormField
          label="Costo interno ($)"
          htmlFor="reparacion-costo"
          required
          error={errores.costo_reparacion}
        >
          <FormInput
            id="reparacion-costo"
            type="number"
            inputMode="numeric"
            min={0}
            autoComplete="off"
            value={value.costo_reparacion ?? ""}
            onChange={(e) => {
              const monto = e.target.value;
              onChange((prev) => ({
                ...prev,
                costo_reparacion: monto === "" ? undefined : Number(monto),
              }));
            }}
          />
        </FormField>
        <FormField
          label="Valor cliente ($)"
          htmlFor="reparacion-valor"
          required
          error={errores.valor_reparacion}
        >
          <FormInput
            id="reparacion-valor"
            type="number"
            inputMode="numeric"
            min={0}
            autoComplete="off"
            value={value.valor_reparacion ?? ""}
            onChange={(e) => {
              const monto = e.target.value;
              onChange((prev) => ({
                ...prev,
                valor_reparacion: monto === "" ? undefined : Number(monto),
              }));
            }}
          />
        </FormField>
        <FormField
          label="Garantía"
          htmlFor="reparacion-garantia"
          hint="(opcional)"
          full
        >
          <FormInput
            id="reparacion-garantia"
            autoComplete="off"
            placeholder="Ej: 6 meses"
            value={value.garantia || ""}
            onChange={(e) => {
              const texto = e.target.value;
              onChange((prev) => ({
                ...prev,
                garantia: String(texto),
              }));
            }}
          />
        </FormField>
      </FormSection>
    </>
  );
};

export default RepairFields;
