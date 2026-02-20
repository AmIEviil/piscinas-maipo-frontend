/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import {
  type IMaintenance,
  type IMaintenanceCreate,
  type IMaintenanceUpdate,
} from "../../../service/maintenance.interface";
import style from "./InfoDialogClient.module.css";
import TableGeneric from "../../ui/table/Table";
import { getWindowWidth } from "../../../utils/WindowUtils";

//Icons
import AddIcon from "@mui/icons-material/Add";
import CaretIcon from "../../ui/Icons/CaretIcon";
import MaintenanceFields from "./maintenancesFields/MaintenancesFields";
import {
  useCreateMaintenance,
  useDeleteMaintenance,
  useUpdateMaintenance,
} from "../../../hooks/MaintenanceHooks";
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
import { useUploadComprobantePago } from "../../../hooks/ComprobantePagosHooks";
import { formatName, getAbbreviation } from "../../../utils/formatTextUtils";
import type { IComprobantePago } from "../../../service/ComprobantePagos.interface";
import ComprobantesContainer from "./comprobantesContainer/ComprobantesContainer";
import LoadingSpinner from "../../ui/loading/Loading";
import { useClientResumenMonthStore } from "../../../store/ClientStore";
import PencilIcon from "../../ui/Icons/PencilIcon";
import TrashIcon from "../../ui/Icons/TrashIcon";
import { Tooltip } from "@mui/material";
import ResumeMaintenance from "./resumeMaintenances/ResumeMaintenance";
import { useModalStore } from "../../../store/ModalStore";
import FieldGroup from "../../ui/labelField/FieldGroup";
import { usePermits } from "../../../utils/roleUtils";

interface InfoClientDialogProps {
  open: boolean;
  clientInfo?: IClientForm;
  maintenancesClient?: Record<string, IMaintenance[]>;
  comprobantesClient?: Record<string, IComprobantePago[]>;
  loading?: boolean;
  onClose: () => void;
  onMaintenanceCreated?: () => void;
  onComprobanteChanged?: () => void;
  onNextClient: () => void;
  onPreviousClient: () => void;
  totalRecords: number;
  currentIndex: number;
}

const InfoClientDialog = ({
  open = false,
  clientInfo,
  maintenancesClient,
  comprobantesClient,
  loading,
  onClose,
  onMaintenanceCreated,
  onComprobanteChanged,
  onNextClient,
  onPreviousClient,
  totalRecords,
  currentIndex,
}: InfoClientDialogProps) => {
  const { isSuperAdmin } = usePermits();

  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();

  const uploadComprobanteMutation = useUploadComprobantePago();
  const setResumenMonthStore = useClientResumenMonthStore(
    (state) => state.setResumenMonth,
  );
  const setClientInfo = useClientResumenMonthStore(
    (state) => state.setClientInfo,
  );
  const setOpenModal = useModalStore((state) => state.openModal);
  const handleCloseModal = useModalStore((state) => state.closeModal);

  const [coordenadas, setCoordenadas] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  const [isAddingMaintenance, setIsAddingMaintenance] = useState(false);
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const [showMaintenances, setShowMaintenances] = useState(windowWidth > 720);
  const { products, fetchProducts } = useProductStore();

  const [months, setMonths] = useState<string[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [maintenanceToEdit, setMaintenanceToEdit] =
    useState<IMaintenance | null>(null);

  const currentMonth = months[currentMonthIndex] ?? null;
  const mantencionesMesActual = useMemo(() => {
    if (!currentMonth) return [];

    const list = maintenancesClient?.[currentMonth];
    if (!Array.isArray(list)) return [];

    return [...list].sort((a, b) =>
      String(a.fechaMantencion).localeCompare(String(b.fechaMantencion)),
    );
  }, [currentMonth, maintenancesClient]);

  const comprobantesMesActual = useMemo(() => {
    if (!currentMonth) return [];
    const list = comprobantesClient?.[currentMonth];
    if (!Array.isArray(list)) return [];

    return [...list].sort((a, b) =>
      String(a.fecha_emision).localeCompare(String(b.fecha_emision)),
    );
  }, [currentMonth, comprobantesClient]);

  const cloroProducts =
    products?.filter((p) => p.tipo.nombre === "Cloro") || [];
  const otherProducts =
    products?.filter((p) => p.tipo.nombre !== "Cloro") || [];

  const titlesTable = [
    { label: "Fecha Mantencion", key: "fechaMantencion", showOrderBy: false },
    ...cloroProducts
      .map((p) =>
        p.nombre
          ? { label: p.nombre, key: "nombre", showOrderBy: false }
          : { label: "", key: "nombre", showOrderBy: false },
      )
      .filter(Boolean),
    { label: "Otros", key: "otros", showOrderBy: false },
    { label: "Realizada", key: "realizada", showOrderBy: false },
    { label: "Recibio Pago", key: "recibioPago", showOrderBy: false },
    { label: "", key: "acciones", showOrderBy: false },
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
            address,
          )}&format=json`,
        );
        const data = await response.json();
        if (!data[0]) {
          setCoordenadas(undefined);
          return;
        }

        setCoordenadas({
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
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
      .sort((a, b) => a.localeCompare(b));

    setMonths(sortedMonths);
    setCurrentMonthIndex(sortedMonths.length - 1);
  }, [maintenancesClient]);

  const handleClose = () => {
    setCoordenadas(undefined);
    setIsAddingMaintenance(false);
    setMaintenanceToEdit(null);
    setResumenMonthStore(null);
    setClientInfo({} as IClientForm);
    setMonths([]);
    setCurrentMonthIndex(0);
    onClose();
  };

  useEffect(() => {
    if (!currentMonth && !clientInfo) return;
    setClientInfo(clientInfo as IClientForm);
  }, [currentMonth, clientInfo, setClientInfo]);

  const handleAcceptMaintenance = async (
    maintenanceData: IMaintenanceCreate | IMaintenanceUpdate,
  ) => {
    try {
      if (maintenanceToEdit) {
        // MODO EDICIÓN
        await updateMaintenance.mutateAsync({
          id: maintenanceToEdit.id,
          data: maintenanceData as IMaintenanceUpdate,
        });
      } else {
        // MODO CREACIÓN
        await createMaintenance.mutateAsync(
          maintenanceData as IMaintenanceCreate,
        );
      }

      // Reset y refresh
      setIsAddingMaintenance(false);
      setMaintenanceToEdit(null);

      if (onMaintenanceCreated) {
        onMaintenanceCreated();
      }
    } catch (err) {
      console.error("Error al guardar mantención:", err);
    }
  };

  const handleCancelMaintenance = () => {
    setIsAddingMaintenance(false);
    setMaintenanceToEdit(null);
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
    [totalRecords, currentIndex, onNextClient, onPreviousClient],
  );

  const handleSubmitComprobante = async (data: {
    monto: number;
    fecha_pago: string;
    comprobante?: File;
  }) => {
    if (!data || !clientInfo) return;
    try {
      const formData = new FormData();
      if (data.comprobante) {
        formData.append("file", data.comprobante);
      }
      formData.append("tipo", "comprobante_mantencion");
      formData.append("parentId", clientInfo.id.value);
      formData.append(
        "nombre",
        formatName(
          `Pago_Mantencion_${formatMonthTitle(currentMonth)}_${
            clientInfo.nombre.value
          }`,
        ),
      );
      formData.append("fecha_emision", data.fecha_pago);
      formData.append("monto", data.monto.toString());

      await uploadComprobanteMutation.mutateAsync(formData);
      if (onComprobanteChanged) {
        onComprobanteChanged();
      }
    } catch (error) {
      console.error("Error al subir el comprobante:", error);
    }
  };

  const handleEditMaintenance = (maintenance: IMaintenance) => {
    setMaintenanceToEdit(maintenance);
    setIsAddingMaintenance(true);
    if (onMaintenanceCreated) {
      onMaintenanceCreated();
    }
  };

  const onDeleteMaintenance = async (maintenanceId: string) => {
    handleCloseModal();
    await deleteMaintenance.mutateAsync(maintenanceId);
    if (onMaintenanceCreated) {
      onMaintenanceCreated();
    }
  };

  const handleDeleteMaintenance = (maintenance: IMaintenance) => {
    setOpenModal({
      header: <strong>Eliminando mantencion</strong>,
      content: (
        <div>
          {" "}
          ¿Estas seguro de eliminar esta mantención de{" "}
          <strong>{clientInfo?.nombre.value}</strong>?
          <div>
            <FieldGroup
              label="Fecha Mantención"
              value={formatDateToDDMMYYYY(maintenance.fechaMantencion)}
            />
            {maintenance.productos.length > 0 && (
              <FieldGroup
                label="Productos Utilizados"
                value={maintenance.productos
                  .map((p) => `${p.product.nombre} (${p.cantidad})`)
                  .join(" - ")}
              />
            )}
          </div>
        </div>
      ),
      footer: (
        <>
          <Button
            label="Cancelar"
            variant="secondary"
            onClick={() => handleCloseModal()}
          />
          <Button
            label="Eliminar"
            onClick={() => onDeleteMaintenance(maintenance.id)}
          />
        </>
      ),
      dialogClassName: "max-w-md! max-h-md!",
    });
  };

  const onAddingMaintenance = () => {
    if (!showMaintenances) setShowMaintenances(true);
    setIsAddingMaintenance(true);
  };

  const onCancelAddingMaintenance = () => {
    setIsAddingMaintenance(false);
    setMaintenanceToEdit(null);
  };

  return (
    <Modal
      show={open}
      onHide={handleClose}
      size="xl"
      centered
      style={{ borderRadius: 32 }}
      dialogClassName="max-h-[90dvh]"
      enforceFocus={false}
    >
      {loading ? (
        <Modal.Body className="flex justify-center items-center p-10 min-h-160! max-h-[40dvh]">
          <LoadingSpinner />
        </Modal.Body>
      ) : (
        <Modal.Body className="max-h-[80dvh] overflow-auto custom-scrollbar ">
          {clientInfo && (
            <ClientFields
              clientInfo={clientInfo}
              coordenadas={coordenadas}
              hasMaintenances={mantencionesMesActual.length > 0}
              onClose={handleClose}
            />
          )}
          <div className="flex flex-row justify-between items-center pb-1">
            <button
              onClick={() => setShowMaintenances(!showMaintenances)}
              disabled={
                !maintenancesClient ||
                Object.keys(maintenancesClient).length === 0
              }
              className="cursor-pointer flex items-center gap-1 font-medium w-fit normal p-2! hover:text-white!"
            >
              {Object.keys(maintenancesClient ?? {}).length
                ? "Ver Mantenciones"
                : "Sin Mantenciones"}
              {Object.keys(maintenancesClient ?? {}).length ? (
                <CaretIcon direction={`${showMaintenances ? "down" : "up"}`} />
              ) : null}
            </button>
            <div className={style.buttonContainer}>
              <button
                className={`${style.buttonInfo} p-1!`}
                onClick={() => {
                  if (isAddingMaintenance) {
                    onCancelAddingMaintenance();
                  } else {
                    onAddingMaintenance();
                  }
                }}
              >
                {isAddingMaintenance
                  ? "Cancelar mantención"
                  : "Agregar nueva mantención"}
                <AddIcon />
              </button>
            </div>
          </div>

          {showMaintenances && (
            <>
              <div className={`${isAddingMaintenance ? "hidden" : "block"}`}>
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
                            {cloroProducts.map((prod) => {
                              const used = mantencion.productos.find(
                                (p) => p.product.id === prod.id,
                              );
                              return (
                                <td key={prod.id}>
                                  {used ? used.cantidad : 0}
                                </td>
                              );
                            })}
                            <td>
                              {mantencion.productos
                                .filter((prodUsed) =>
                                  otherProducts.some(
                                    (op) => op.id === prodUsed.product.id,
                                  ),
                                )
                                .map((prodUsed) => (
                                  <div
                                    key={prodUsed.product.id}
                                    style={{ whiteSpace: "nowrap" }}
                                  >
                                    {getAbbreviation(prodUsed.product.nombre)} -{" "}
                                    {prodUsed.cantidad}
                                  </div>
                                ))}
                            </td>
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
                            <td className="p-2! text-center">
                              <Tooltip
                                title={"Editar Mantención"}
                                arrow
                                leaveDelay={0}
                              >
                                <button
                                  className="normal p-1!"
                                  onClick={() =>
                                    handleEditMaintenance(mantencion)
                                  }
                                >
                                  <PencilIcon />
                                </button>
                              </Tooltip>
                              <Tooltip
                                title={"Eliminar Mantención"}
                                arrow
                                leaveDelay={0}
                              >
                                <button
                                  className="normal p-1!"
                                  onClick={() =>
                                    handleDeleteMaintenance(mantencion)
                                  }
                                >
                                  <TrashIcon />
                                </button>
                              </Tooltip>
                            </td>
                          </tr>
                        )}
                      />
                    </div>
                    <ResumeMaintenance
                      currentMonth={currentMonth}
                      valor_mantencion={clientInfo?.valor_mantencion.value ?? 0}
                      mantencionesMesActual={mantencionesMesActual}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 ">
                    <p className="text-gray-500">
                      No hay mantenciones para mostrar
                    </p>
                  </div>
                )}
              </div>
              {isAddingMaintenance && (
                <MaintenanceFields
                  clientId={clientInfo?.id.value ?? ""}
                  valorMantencion={clientInfo?.valor_mantencion.value ?? 0}
                  productosList={products}
                  onAccept={handleAcceptMaintenance}
                  onCancel={handleCancelMaintenance}
                  isEditing={!!maintenanceToEdit}
                  mantencionData={maintenanceToEdit}
                />
              )}
              {maintenancesClient &&
                isSuperAdmin &&
                Object.keys(maintenancesClient).length > 0 && (
                  <ComprobantesContainer
                    comprobantesData={comprobantesMesActual}
                    onApprove={handleSubmitComprobante}
                  />
                )}
            </>
          )}
        </Modal.Body>
      )}

      <Modal.Footer>
        {dialogFooter}
        <Button label="Cerrar" onClick={handleClose} variant="primary" />
      </Modal.Footer>
    </Modal>
  );
};

export default InfoClientDialog;
