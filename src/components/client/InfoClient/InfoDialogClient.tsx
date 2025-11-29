import { useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle } from "@mui/material";
import clsx from "clsx";
import { type Client } from "../../../service/clientInterface";
import {
  type IMaintenance,
  type IMaintenanceCreate,
} from "../../../service/maintenanceInterface";
import style from "./InfoDialogClient.module.css";
import GoogleMapFromAddress from "../../ui/googleMapEmbed.tsx/GoogleMapEmbed";
import TableGeneric from "../../ui/table/Table";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import { getWindowWidth } from "../../../utils/WindowUtils";

//Icons
import EmailIcon from "@mui/icons-material/Email";
import AddIcon from "@mui/icons-material/Add";
import PaidIcon from "@mui/icons-material/Paid";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PoolIcon from "@mui/icons-material/Pool";
import ExploreIcon from "@mui/icons-material/Explore";
import CaretIcon from "../../ui/Icons/CaretIcon";
import MaintenanceFields from "./MaintenancesFields";
import { useCreateMaintenance } from "../../../hooks/MaintenanceHooks";
import { useProductStore } from "../../../store/ProductStore";
import {
  formatDateToDDMMYYYY,
  formatMonthTitle,
} from "../../../utils/DateUtils";
import CustomPagination from "../../ui/pagination/Pagination";
import SeeMoreButton from "../../common/SeeMore/SeeMoreButton";

interface InfoClientDialogProps {
  open: boolean;
  clientInfo?: Client;
  maintenancesClient?: Record<string, IMaintenance[]>;
  onClose: () => void;
  onMaintenanceCreated?: () => void;
  onNextClient: () => void;
  onPreviousClient: () => void;
  totalRecords: number;
  currentIndex: number;
}

const InfoClientDialog = ({
  open = false,
  clientInfo,
  onClose,
  maintenancesClient,
  onMaintenanceCreated,
  onNextClient,
  onPreviousClient,
  totalRecords,
  currentIndex,
}: InfoClientDialogProps) => {
  const createMaintenance = useCreateMaintenance();
  const [coordenadas, setCoordenadas] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  const [isAddingMaintenance, setIsAddingMaintenance] = useState(false);
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const [showClientInfo, setShowClientInfo] = useState(windowWidth > 720);
  const [showMaintenances, setShowMaintenances] = useState(windowWidth > 720);
  const { products, fetchProducts } = useProductStore();

  const [months, setMonths] = useState<string[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const currentMonth = months[currentMonthIndex] ?? null;
  const mantencionesMesActual = currentMonth
    ? maintenancesClient?.[currentMonth].sort((a, b) =>
        String(a.fechaMantencion).localeCompare(String(b.fechaMantencion))
      ) ?? []
    : [];

  const allProducts = products ?? [];

  const titlesTable = [
    { label: "Fecha Mantencion", showOrderBy: false },
    ...allProducts
      .map((p) =>
        p.nombre
          ? { label: p.nombre, showOrderBy: false }
          : { label: "", showOrderBy: false }
      )
      .filter(Boolean),
    { label: "Otros", showOrderBy: false },
    { label: "Realizada", showOrderBy: false },
    { label: "Recibio Pago", showOrderBy: false },
  ];

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  useEffect(() => {
    if (!maintenancesClient) return;

    const sortedMonths = Object.keys(maintenancesClient)
      .map((m) => {
        const [year, month] = m.split("-");
        const mm = month.padStart(2, "0");
        return `${year}-${mm}`;
      })
      .sort();

    setMonths(sortedMonths);
    setCurrentMonthIndex(sortedMonths.length - 1);
  }, [maintenancesClient]);

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
      }

      for (const prod of mant.productos) {
        const nombre = prod.product.nombre;
        const valorUnitario = prod.product.valor_unitario;
        const cantidad = prod.cantidad;

        if (!resumenMateriales[nombre]) {
          resumenMateriales[nombre] = {
            cantidad: cantidad,
            valorUnitario,
            total: valorUnitario,
          };
        } else {
          resumenMateriales[nombre].cantidad += cantidad;
          resumenMateriales[nombre].total += valorUnitario * cantidad;
        }

        totalProductos += valorUnitario * cantidad;
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

  const resumen = currentMonth
    ? calcularResumenMantenciones(
        mantencionesMesActual,
        clientInfo?.valor_mantencion ?? 0
      )
    : {
        resumenMateriales: {},
        totalMantencion: 0,
        granTotal: 0,
        totalProductos: 0,
      };

  const handleAcceptMaintenance = async (
    maintenanceData: IMaintenanceCreate
  ) => {
    try {
      await createMaintenance.mutateAsync(maintenanceData);
      setIsAddingMaintenance(false);
      if (onMaintenanceCreated) {
        onMaintenanceCreated();
      }
    } catch (err) {
      console.error("Error al crear mantención:", err);
    }
  };

  const handleCancelMaintenance = () => {
    setIsAddingMaintenance(false);
  };

  const renderFooter = () => {
    if (totalRecords <= 1) return null;

    return (
      <>
        <div>
          <span className="font-bold">
            {currentIndex + 1}/{totalRecords}
          </span>
        </div>
        <div>
          <CustomPagination
            actualPage={currentIndex + 1}
            totalPages={totalRecords}
            onPageChange={(page) => {
              if (page > currentIndex + 1) {
                onNextClient();
              } else {
                onPreviousClient();
              }
            }}
          />
        </div>
      </>
    );
  };

  const dialogFooter = useMemo(
    () => renderFooter(),
    [totalRecords, currentIndex, onNextClient, onPreviousClient]
  );

  return (
    <Dialog
      fullWidth={true}
      maxWidth={"xl"}
      open={open}
      onClose={handleClose}
      style={{ borderRadius: 32 }}
    >
      <DialogContent className="custom-scrollbar">
        {clientInfo && (
          <div className={style.clientInfoContainer}>
            <DialogTitle style={{ padding: 0 }}>
              {clientInfo?.nombre} - {clientInfo?.direccion} -{" "}
              {clientInfo?.comuna}
            </DialogTitle>
            <div
              className="flex flex-row items-center text-center align-middle w-full gap-2"
              onClick={() =>
                windowWidth < 720 ? setShowClientInfo(!showClientInfo) : null
              }
            >
              <span className="font-medium ">Info Cliente</span>
              {windowWidth < 720 && (
                <span className="cursor-pointer">
                  <CaretIcon direction="down" />
                </span>
              )}
            </div>
            <div className={style.detailsInfoContainer}>
              {showClientInfo && (
                <div className={style.labelsContainer}>
                  <div className={style.labelItemContainer}>
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
                  <div className={style.labelItemContainer}>
                    <span className={`${style.labelItem} text-left bg-red-500`}>
                      <EmailIcon className={style.iconItem} /> Email:{" "}
                      {clientInfo.email
                        ? clientInfo.email
                        : "Sin correo electrónico"}
                    </span>
                    <span className={style.labelItem}>
                      <CalendarMonthIcon className={style.iconItem} /> Fecha
                      Ingreso:{" "}
                      {clientInfo.fecha_ingreso
                        ? formatDateToDDMMYYYY(clientInfo.fecha_ingreso)
                        : "No tiene fecha de ingreso"}
                    </span>
                    <span className={style.labelItem}>
                      <a
                        href={`https://www.google.com/maps?q=${coordenadas?.lat},${coordenadas?.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1976d2",
                          textDecoration: "underline",
                        }}
                        className={style.googleLink}
                      >
                        <ExploreIcon className={style.iconItem} />
                        Ver en Google Maps
                      </a>
                    </span>
                  </div>
                  {windowWidth > 720 && (
                    <div>
                      <button
                        className={clsx(style.labelItem, style.buttonInfo)}
                      >
                        Generar Boleta
                      </button>
                    </div>
                  )}
                </div>
              )}
              {windowWidth > 720 && (
                <div>
                  <GoogleMapFromAddress
                    lat={coordenadas?.lat ?? 0}
                    lng={coordenadas?.lng ?? 0}
                    width="300px"
                    height="200px"
                    zoom={200}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-row justify-between items-center ">
          <span
            onClick={() => setShowMaintenances(!showMaintenances)}
            className="cursor-pointer flex items-center gap-1 font-medium mt-4 mb-2 select-none w-fit"
          >
            {Object.keys(maintenancesClient ?? {}).length
              ? "Ver Mantenciones"
              : "Sin Mantenciones"}
            {Object.keys(maintenancesClient ?? {}).length ? (
              <CaretIcon direction={`${showMaintenances ? "down" : "up"}`} />
            ) : null}
          </span>
          <div className={style.buttonContainer}>
            <button
              className={`${style.buttonInfo} p-1!`}
              onClick={() => setIsAddingMaintenance(true)}
            >
              <AddIcon />
            </button>
          </div>
        </div>

        {showMaintenances && (
          <>
            {Object.keys(maintenancesClient ?? {}).length ? (
              <div className={style.maintenancesContainer}>
                <div className={style.tableContainer}>
                  <div className="flex items-center justify-between py-3">
                    <button
                      disabled={currentMonthIndex === 0}
                      onClick={() => setCurrentMonthIndex((i) => i - 1)}
                    >
                      <CaretIcon direction="left" color="white" />
                    </button>

                    <h3 className="text-lg font-bold">
                      {currentMonth ? formatMonthTitle(currentMonth) : ""}
                    </h3>

                    <button
                      disabled={currentMonthIndex >= months.length - 1}
                      onClick={() => setCurrentMonthIndex((i) => i + 1)}
                    >
                      <CaretIcon direction="right" color="white" />
                    </button>
                  </div>
                  <TableGeneric
                    titles={titlesTable}
                    data={mantencionesMesActual}
                    renderRow={(mantencion) => (
                      <tr key={mantencion.id}>
                        <td>
                          {formatDateToDDMMYYYY(mantencion.fechaMantencion)}
                        </td>

                        {allProducts.map((prod) => {
                          const used = mantencion.productos.find(
                            (p) => p.product.id === prod.id
                          );
                          return (
                            <td key={prod.id}>{used ? used.cantidad : 0}</td>
                          );
                        })}

                        <td>{mantencion.otros}</td>
                        <td>{mantencion.realizada ? "Sí" : "No"}</td>
                        <td className="pr-0!">
                          <span className="flex items-center gap-2 justify-between pr-0!">
                            {mantencion.recibioPago ? "Sí" : "No"}

                            {mantencion.observaciones && (
                              <SeeMoreButton
                                content={mantencion.observaciones}
                              />
                            )}
                          </span>
                        </td>
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
                          {nombre} -{" "}
                          {data.valorUnitario.toLocaleString("es-CL")}
                          {" x "}
                          {data.cantidad}
                        </span>
                        <span>${data.total.toLocaleString("es-CL")}</span>
                      </div>
                    )
                  )}

                  <div className={style.totalValues}>
                    <strong>Total productos:</strong>
                    <span>
                      ${resumen.totalProductos.toLocaleString("es-CL")}
                    </span>
                  </div>
                  <div className={style.totalValues}>
                    <strong>Total mantenciones:</strong>
                    <span>
                      ${resumen.totalMantencion.toLocaleString("es-CL")}
                    </span>
                  </div>
                  <div className={style.totalValues}>
                    <strong>Total general:</strong>
                    <span>${resumen.granTotal.toLocaleString("es-CL")}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {isAddingMaintenance && (
          <MaintenanceFields
            clientId={clientInfo?.id ?? ""}
            valorMantencion={clientInfo?.valor_mantencion ?? 0}
            productosList={products}
            onAccept={handleAcceptMaintenance}
            onCancel={handleCancelMaintenance}
          />
        )}
      </DialogContent>
      <DialogActions>
        {dialogFooter}
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoClientDialog;
