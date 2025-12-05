import type { Client } from "../../../service/client.interface";
import type { IRepairCreate } from "../../../service/repairs.interface";

import CustomSelect from "../../ui/Select/Select";
import CustomInputText from "../../ui/InputText/CustomInputText";
import { CustomTextArea } from "../../ui/InputText/CustonTextArea";

import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import Calendar from "../../ui/datepicker/DatePicker";

import style from "./CreateRepairsDialog.module.css";

interface RepairFieldsProps {
  clients: Client[];
  value: Partial<IRepairCreate>;
  onChange: (
    updater: (prev: Partial<IRepairCreate>) => Partial<IRepairCreate>
  ) => void;
}

const RepairFields = ({ clients, value, onChange }: RepairFieldsProps) => {
  const optionsClients = clients
    .filter(
      (c): c is Client & { id: string } => c.id !== undefined && c.id !== null
    )
    .map((client) => ({
      value: client.id.toString(),
      label: client.nombre,
    }));
  return (
    <div className={style.container}>
      {/* Sección 1: Información General */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <PersonIcon fontSize="small" /> Cliente
        </h4>
        <div className={style.gridContainer}>
          <CustomSelect
            title="Seleccionar Cliente"
            required
            label=""
            options={optionsClients}
            value={
              value.client_id?.toString() || value.client?.id?.toString() || ""
            }
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                client_id: String(event.target.value),
              }))
            }
          />
        </div>
      </div>

      {/* Sección 2: Fechas */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <CalendarMonthIcon fontSize="small" /> Fechas Importantes
        </h4>
        <div className={style.gridContainer}>
          <Calendar
            title="Fecha de Ingreso"
            mode="day"
            required
            initialValue={
              value.fecha_ingreso ? new Date(value.fecha_ingreso) : null
            }
            onChange={({ start }) => {
              onChange((prev) => ({
                ...prev,
                fecha_ingreso: start ? start.toISOString().split("T")[0] : "",
              }));
            }}
          />
          <Calendar
            title="Fecha de Trabajo"
            mode="day"
            required
            initialValue={
              value.fecha_trabajo ? new Date(value.fecha_trabajo) : null
            }
            onChange={({ start }) => {
              onChange((prev) => ({
                ...prev,
                fecha_trabajo: start ? start.toISOString().split("T")[0] : "",
              }));
            }}
          />
        </div>
      </div>

      {/* Sección 3: Detalles del Trabajo */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <DescriptionIcon fontSize="small" /> Detalles del Trabajo
        </h4>
        <div className={style.gridContainer}>
          <div style={{ gridColumn: "1 / -1" }}>
            <CustomTextArea
              title="Detalles de la Reparación"
              required
              value={value.detalles || ""}
              onChange={(value) =>
                onChange((prev) => ({ ...prev, detalles: value }))
              }
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <CustomTextArea
              title="Materiales a Utilizar"
              required
              value={value.materiales || ""}
              onChange={(value) =>
                onChange((prev) => ({ ...prev, materiales: value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Sección 4: Costos y Garantía */}
      <div className={style.section}>
        <h4 className={style.sectionTitle}>
          <MonetizationOnIcon fontSize="small" /> Costos y Garantía
        </h4>
        <div className={style.gridContainer}>
          <CustomInputText
            title="Costo Interno ($)"
            type="number"
            value={value.costo_reparacion || ""}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                costo_reparacion: Number(value),
              }))
            }
          />
          <CustomInputText
            title="Valor Cliente ($)"
            type="number"
            value={value.valor_reparacion || ""}
            onChange={(value) =>
              onChange((prev) => ({
                ...prev,
                valor_reparacion: Number(value),
              }))
            }
          />
          <div className="flex items-end">
            <VerifiedUserIcon className="text-gray-400 mr-2 mb-2" />
            <CustomInputText
              title="Garantía"
              value={value.garantia || ""}
              onChange={(value) =>
                onChange((prev) => ({
                  ...prev,
                  garantia: String(value),
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairFields;
