/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import {
  type IMaintenance,
  type IMaintenanceCreate,
} from "../../../service/maintenance.interface";
import style from "./InfoDialogClient.module.css";
import TableGeneric from "../../ui/table/Table";
import { getWindowWidth } from "../../../utils/WindowUtils";

//Icons
import AddIcon from "@mui/icons-material/Add";
import CaretIcon from "../../ui/Icons/CaretIcon";
import MaintenanceFields from "./maintenancesFields/MaintenancesFields";
import { useCreateMaintenance } from "../../../hooks/MaintenanceHooks";
import { useProductStore } from "../../../store/ProductStore";
import {
  formatDateToDDMMYYYY,
  formatMonthTitle,
} from "../../../utils/DateUtils";
import CustomPagination from "../../ui/pagination/Pagination";
import SeeMoreButton from "../../common/SeeMore/SeeMoreButton";
import ClientFields, {
  type IClientForm,
} from "./clientInfoFields/ClientInfoFields";
import { Modal } from "react-bootstrap";
import Button from "../../ui/button/Button";

interface InfoClientDialogProps {
  open: boolean;
  clientInfo?: IClientForm;
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
  const [showMaintenances, setShowMaintenances] = useState(windowWidth > 720);
  const { products, fetchProducts } = useProductStore();

  const [months, setMonths] = useState<string[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const currentMonth = months[currentMonthIndex] ?? null;
  const mantencionesMesActual =
    currentMonth && Array.isArray(maintenancesClient?.[currentMonth])
      ? [...maintenancesClient[currentMonth]].sort((a, b) =>
          String(a.fechaMantencion).localeCompare(String(b.fechaMantencion))
        )
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

    const direccion = `${clientInfo.direccion.value}, ${clientInfo.comuna.value}, Chile`;

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

    const sortedMonths = Object.entries(maintenancesClient)
      .filter(([_, value]) => Array.isArray(value) && value.length > 0)
      .map(([key]) => key)
      .map((m) => {
        const [year, month] = m.split("-");
        return `${year}-${month.padStart(2, "0")}`;
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
        clientInfo?.valor_mantencion.value ?? 0
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
    <Modal
      show={open}
      onHide={handleClose}
      size="xl"
      centered
      style={{ borderRadius: 32 }}
    >
      <Modal.Body className="custom-scrollbar">
        {clientInfo && (
          <ClientFields clientInfo={clientInfo} coordenadas={coordenadas} />
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
            clientId={clientInfo?.id.value ?? ""}
            valorMantencion={clientInfo?.valor_mantencion.value ?? 0}
            productosList={products}
            onAccept={handleAcceptMaintenance}
            onCancel={handleCancelMaintenance}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        {dialogFooter}
        <Button label="Cerrar" onClick={handleClose} variant="primary" />
      </Modal.Footer>
    </Modal>
  );
};

export default InfoClientDialog;
