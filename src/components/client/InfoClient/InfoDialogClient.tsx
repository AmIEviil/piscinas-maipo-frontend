import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle } from "@mui/material";
import clsx from "clsx";
import { type Client } from "../../../service/clientInterface";
import { type IMaintenance } from "../../../service/maintenanceInterface";
import style from "./InfoDialogClient.module.css";
import GoogleMapFromAddress from "../../ui/googleMapEmbed.tsx/GoogleMapEmbed";
import TableGeneric from "../../ui/table/Table";

//Icons
import EmailIcon from "@mui/icons-material/Email";
import PaidIcon from "@mui/icons-material/Paid";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PoolIcon from "@mui/icons-material/Pool";
import ExploreIcon from "@mui/icons-material/Explore";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";

interface InfoClientDialogProps {
  open: boolean;
  clientInfo?: Client;
  maintenancesClient?: IMaintenance[];
  onClose: () => void;
}

const titlesTable = [
  { label: "Fecha Mantencion", showOrderBy: false },
  { label: "Tabletas", showOrderBy: false },
  { label: "Cloro Liquido", showOrderBy: true },
  { label: "Cloro Granulado", showOrderBy: true },
  { label: "Otros", showOrderBy: true },
  { label: "Realizada", showOrderBy: true },
  { label: "Recibio Pago", showOrderBy: true },
];

const InfoClientDialog = ({
  open = false, // Valor por defecto false
  clientInfo,
  onClose,
  maintenancesClient,
}: InfoClientDialogProps) => {
  const [coordenadas, setCoordenadas] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  useEffect(() => {
    if (!clientInfo?.direccion || !clientInfo?.comuna) return;

    const direccion = `${clientInfo.direccion}, ${clientInfo.comuna}, Chile`;

    const getCoordsFromAddress = async (address: string) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            address
          )}&format=json`
        );
        const data = await response.json();

        if (!data[0]) {
          setCoordenadas(undefined);
          return;
        }

        setCoordenadas({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      } catch (error) {
        console.error("Error al obtener coordenadas:", error);
      }
    };

    getCoordsFromAddress(direccion);
  }, [clientInfo]);

  const handleClose = () => {
    setCoordenadas(undefined);
    onClose();
  };

  const calcularResumenMantenciones = (
    mantenciones: IMaintenance[],
    valorMantencion: number
  ) => {
    const resumenMateriales: Record<
      string,
      { cantidad: number; valorUnitario: number; total: number }
    > = {};

    let totalMantencion = 0;
    let totalProductos = 0;

    for (const mant of mantenciones) {
      if (mant.realizada) {
        totalMantencion += valorMantencion;

        for (const prod of mant.productos) {
          const nombre = prod.product.nombre;
          const valorUnitario = prod.product.valor_unitario;

          if (!resumenMateriales[nombre]) {
            resumenMateriales[nombre] = {
              cantidad: 1,
              valorUnitario,
              total: valorUnitario,
            };
          } else {
            resumenMateriales[nombre].cantidad += 1;
            resumenMateriales[nombre].total += valorUnitario;
          }

          totalProductos += valorUnitario;
        }
      }
    }

    const granTotal = totalMantencion + totalProductos;

    return {
      resumenMateriales,
      totalMantencion,
      totalProductos,
      granTotal,
    };
  };

  const resumen =
    clientInfo && maintenancesClient
      ? calcularResumenMantenciones(
          maintenancesClient,
          clientInfo.valor_mantencion
        )
      : {
          resumenMateriales: {},
          totalMantencion: 0,
          granTotal: 0,
          totalProductos: 0,
        };

  return (
    <Dialog fullWidth={true} maxWidth={"xl"} open={open} onClose={handleClose}>
      <DialogContent style={{ borderRadius: 16 }}>
        {clientInfo && (
          <div className={style.clientInfoContainer}>
            <DialogTitle style={{ padding: 0 }}>
              {clientInfo?.nombre} - {clientInfo?.direccion} -{" "}
              {clientInfo?.comuna}
            </DialogTitle>
            <div className={style.detailsInfoContainer}>
              <div className={style.labelsContainer}>
                <div>
                  <span className={style.labelItem}>
                    <CalendarMonthIcon className={style.iconItem} /> Dia de
                    Mantención: {clientInfo.dia_mantencion}
                  </span>
                  <span className={style.labelItem}>
                    <PaidIcon className={style.iconItem} /> Valor Mantención:{" "}
                    {formatMoneyNumber(clientInfo.valor_mantencion)}
                  </span>
                  <span className={style.labelItem}>
                    <PoolIcon className={style.iconItem} /> Tipo Piscina:{" "}
                    {clientInfo.tipo_piscina}
                  </span>
                </div>
                <div>
                  <span className={style.labelItem}>
                    <EmailIcon className={style.iconItem} /> Email:{" "}
                    {clientInfo.email
                      ? clientInfo.email
                      : "No tiene email asociado"}
                  </span>
                  <span className={style.labelItem}>
                    <CalendarMonthIcon className={style.iconItem} /> Fecha
                    Ingreso:{" "}
                    {clientInfo.fecha_ingreso
                      ? clientInfo.fecha_ingreso.toString()
                      : "No tiene fecha de ingreso"}
                  </span>
                  <span className={style.labelItem}>
                    <a
                      href={`https://www.google.com/maps?q=${coordenadas?.lat},${coordenadas?.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1976d2", textDecoration: "underline" }}
                      className={style.googleLink}
                    >
                      <ExploreIcon className={style.iconItem} />
                      Ver en Google Maps
                    </a>
                  </span>
                </div>
                <div>
                  <button className={clsx(style.labelItem, style.buttonInfo)}>
                    Obtener control diario
                  </button>
                  <button className={clsx(style.labelItem, style.buttonInfo)}>
                    Generar Boleta
                  </button>
                  <button className={clsx(style.labelItem, style.buttonInfo)}>
                    Obtener control diario
                  </button>
                </div>
              </div>
              <div>
                <GoogleMapFromAddress
                  lat={coordenadas?.lat ?? 0}
                  lng={coordenadas?.lng ?? 0}
                  width="300px"
                  height="200px"
                  zoom={200}
                />
              </div>
            </div>
          </div>
        )}
        {maintenancesClient?.length && (
          <div className={style.maintenancesContainer}>
            <div className={style.tableContainer}>
              <TableGeneric
                titles={titlesTable}
                data={maintenancesClient ?? []}
                renderRow={(mantencion) => (
                  <tr key={mantencion.id}>
                    <td>{mantencion.fechaMantencion.toString()}</td>
                    <td>{mantencion.cantTabletas}</td>
                    <td>{mantencion.cantBidones}</td>
                    <td>{mantencion.cantTabletas}</td>
                    <td>{mantencion.otros}</td>
                    <td>{mantencion.realizada}</td>
                    <td>{mantencion.recibioPago}</td>
                  </tr>
                )}
              />
            </div>
            <div className={style.totalMes}>
              <span className={style.titleTotal}>Resumen</span>

              {Object.entries(resumen.resumenMateriales).map(
                ([nombre, data]) => (
                  <div key={nombre} className={style.totalValues}>
                    <span>
                      {nombre} - {data.valorUnitario.toLocaleString("es-CL")}
                      {" x "}
                      {data.cantidad}
                    </span>
                    <span>${data.total.toLocaleString("es-CL")}</span>
                  </div>
                )
              )}

              <div className={style.totalValues}>
                <strong>Total productos:</strong>
                <span>${resumen.totalProductos.toLocaleString("es-CL")}</span>
              </div>
              <div className={style.totalValues}>
                <strong>Total mantenciones:</strong>
                <span>${resumen.totalMantencion.toLocaleString("es-CL")}</span>
              </div>
              <div className={style.totalValues}>
                <strong>Total general:</strong>
                <span>${resumen.granTotal.toLocaleString("es-CL")}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoClientDialog;
