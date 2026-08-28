import { useEffect, useMemo, useState } from "react";
import {
  type IMaintenance,
  type IMaintenanceCreate,
  type IMaintenanceUpdate,
} from "../../../service/maintenance.interface";
import style from "./InfoDialogClient.module.css";
import { getWindowWidth } from "../../../utils/WindowUtils";

//Icons
import AddIcon from "@mui/icons-material/Add";
import CaretIcon from "../../ui/Icons/CaretIcon";
import MaintenanceSheet from "./sheets/MaintenanceSheet";
import PaymentSheet from "./sheets/PaymentSheet";
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
import ClientFields from "./clientInfoFields/ClientInfoFields";
import { Modal } from "react-bootstrap";
import Button from "../../ui/button/Button";
import { useUploadComprobantePago } from "../../../hooks/ComprobantePagosHooks";
import { formatName } from "../../../utils/formatTextUtils";
import type { IComprobantePago } from "../../../service/ComprobantePagos.interface";
import ComprobantesContainer from "./comprobantesContainer/ComprobantesContainer";
import LoadingSpinner from "../../ui/loading/Loading";
import { useClientResumenMonthStore } from "../../../store/ClientStore";
import MaintenanceTimeline from "./maintenances/MaintenanceTimeline";
import MonthStatusPanel from "./maintenances/MonthStatusPanel";
import { useModalStore } from "../../../store/ModalStore";
import FieldGroup from "../../ui/labelField/FieldGroup";
import { usePermits } from "../../../utils/roleUtils";
import { BREAKPOINTS } from "../../../constant/breakpoints";
import type { IClientForm } from "./types";
import ClientDialogHeader from "./header/ClientDialogHeader";
import ClientTabs, { type PestanaId } from "./tabs/ClientTabs";
import { useMonthNavigation } from "./hooks/useMonthNavigation";
import MonthBar from "./monthBar/MonthBar";
import BodyRepairs from "../../repairs/BodyRepairs";

interface VisitaCubrible {
  id: string;
  etiqueta: string;
  monto: number;
}

interface InfoClientDialogProps {
  open: boolean;
  clientInfo?: IClientForm;
  maintenancesClient?: Record<string, IMaintenance[]>;
  comprobantesClient?: Record<string, IComprobantePago[]>;
  loading?: boolean;
  onClose: () => void;
  onMaintenanceCreated?: () => void;
  onComprobanteChanged?: () => void;
  onClientUpdated?: () => void;
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
  onClientUpdated,
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
  const abrirBoleta = useClientResumenMonthStore((state) => state.openModal);
  const setOpenModal = useModalStore((state) => state.openModal);
  const handleCloseModal = useModalStore((state) => state.closeModal);

  const [coordenadas, setCoordenadas] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const [showMaintenances, setShowMaintenances] = useState(windowWidth > BREAKPOINTS.tablet);
  const { products, fetchProducts } = useProductStore();

  const [maintenanceToEdit, setMaintenanceToEdit] =
    useState<IMaintenance | null>(null);

  const [pestanaActiva, setPestanaActiva] = useState<PestanaId>("mantenciones");
  const { meses, mesActivo, setMesActivo } = useMonthNavigation(maintenancesClient);
  const [hojaMantencionAbierta, setHojaMantencionAbierta] = useState(false);
  const [hojaPagoAbierta, setHojaPagoAbierta] = useState(false);
  // Visita recien creada/editada que encadeno el registro del pago: viene
  // marcada y bloqueada en la hoja de pago. null cuando la hoja de pago se
  // abre directo desde la pestana Cobros (sin encadenado).
  const [visitaFijada, setVisitaFijada] = useState<VisitaCubrible | null>(
    null,
  );
  // true solo mientras la hoja de pago esta encadenada tras guardar una
  // mantencion; false cuando se abre directo desde Cobros.
  const [pagoEncadenado, setPagoEncadenado] = useState(false);

  // Defensa por si isSuperAdmin cambiara con el dialogo ya abierto en
  // "cobros" (p. ej. una demora de hidratacion del rol): ClientTabs deja de
  // renderizar esa pestana para el no-superadmin, y sin este efecto
  // ninguna pestana quedaria con tabIndex 0 (activa == "cobros" no calza
  // con ningun boton montado), ademas de dejar al usuario sin forma de
  // volver a activar una pestana desde la UI.
  useEffect(() => {
    if (!isSuperAdmin && pestanaActiva === "cobros") {
      setPestanaActiva("mantenciones");
    }
  }, [isSuperAdmin, pestanaActiva]);

  const mantencionesDelMes = useMemo(() => {
    if (!mesActivo) return [];
    const lista = maintenancesClient?.[mesActivo];
    if (!Array.isArray(lista)) return [];
    return [...lista].sort((a, b) =>
      String(a.fechaMantencion).localeCompare(String(b.fechaMantencion)),
    );
  }, [mesActivo, maintenancesClient]);

  const comprobantesDelMes = useMemo(() => {
    if (!mesActivo) return [];
    const lista = comprobantesClient?.[mesActivo];
    if (!Array.isArray(lista)) return [];
    return [...lista].sort((a, b) =>
      String(a.fecha_emision).localeCompare(String(b.fecha_emision)),
    );
  }, [mesActivo, comprobantesClient]);

  // Opciones de la hoja de pago para "que visitas cubre este pago": las
  // visitas del mes que aun no tienen pago, salvo la recien fijada (esa ya
  // viene aparte, marcada y bloqueada, para que no aparezca dos veces
  // mientras el listado del mes todavia no refresca tras el guardado).
  const visitasSinPago = useMemo(
    () =>
      mantencionesDelMes
        .filter((m) => !m.recibioPago && m.id !== visitaFijada?.id)
        .map((m) => ({
          id: m.id,
          etiqueta: formatDateToDDMMYYYY(m.fechaMantencion),
          monto: clientInfo?.valor_mantencion?.value ?? 0,
        })),
    [mantencionesDelMes, clientInfo, visitaFijada],
  );

  /** Proximo dia de la semana que coincide con el dia de mantencion. */
  const proximaVisita = useMemo(() => {
    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const dia = String(clientInfo?.dia_mantencion?.value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    const objetivo = dias.indexOf(dia);
    if (objetivo < 0) return null;

    const hoy = new Date();
    const delta = (objetivo - hoy.getDay() + 7) % 7 || 7;
    const proxima = new Date(hoy);
    proxima.setDate(hoy.getDate() + delta);
    return proxima;
  }, [clientInfo]);

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

  const handleClose = () => {
    setCoordenadas(undefined);
    setHojaMantencionAbierta(false);
    setMaintenanceToEdit(null);
    setHojaPagoAbierta(false);
    setPagoEncadenado(false);
    setVisitaFijada(null);
    setResumenMonthStore(null);
    setClientInfo({} as IClientForm);
    setPestanaActiva("mantenciones");
    onClose();
  };

  useEffect(() => {
    if (!mesActivo && !clientInfo) return;
    setClientInfo(clientInfo as IClientForm);
  }, [mesActivo, clientInfo, setClientInfo]);

  const handleAcceptMaintenance = async (
    maintenanceData: IMaintenanceCreate | IMaintenanceUpdate,
  ): Promise<IMaintenance | undefined> => {
    try {
      // Se guarda el resultado en ambas ramas (no solo se espera la
      // promesa): el encadenado con la hoja de pago necesita el id de la
      // mantencion recien creada/editada para fijarla, marcada y bloqueada,
      // en la lista de "que visitas cubre este pago".
      const resultado = maintenanceToEdit
        ? await updateMaintenance.mutateAsync({
            id: maintenanceToEdit.id,
            data: maintenanceData as IMaintenanceUpdate,
          })
        : await createMaintenance.mutateAsync(
            maintenanceData as IMaintenanceCreate,
          );

      // Reset y refresh
      setMaintenanceToEdit(null);

      if (onMaintenanceCreated) {
        onMaintenanceCreated();
      }

      return resultado;
    } catch (err) {
      console.error("Error al guardar mantención:", err);
      return undefined;
    }
  };

  // La regla del encadenado: nunca dos hojas abiertas. La hoja de mantencion
  // se cierra por completo (setHojaMantencionAbierta(false)) y solo despues,
  // cuando termina su transicion de salida, entra la hoja de pago.
  const guardarMantencion = async (
    datos: IMaintenanceCreate | IMaintenanceUpdate,
    registrarPago: boolean,
  ) => {
    const creada = await handleAcceptMaintenance(datos);
    setHojaMantencionAbierta(false);

    if (!registrarPago) return;

    // La hoja de mantencion tiene 260ms de transicion de salida (ver
    // SlideSheet.module.css, `.hoja`). Se espera a que termine para que
    // nunca haya dos dialogos vivos a la vez.
    setVisitaFijada(
      creada
        ? {
            id: creada.id,
            etiqueta: formatDateToDDMMYYYY(creada.fechaMantencion),
            monto: clientInfo?.valor_mantencion?.value ?? 0,
          }
        : null,
    );
    setPagoEncadenado(true);
    window.setTimeout(() => setHojaPagoAbierta(true), 260);
  };

  const handleSubmitComprobante = async (data: {
    monto: number;
    fecha_pago: string;
    comprobante?: File;
    mantencionIds?: string[];
  }) => {
    if (!data || !clientInfo || !mesActivo) return;
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
          `Pago_Mantencion_${formatMonthTitle(mesActivo)}_${
            clientInfo.nombre.value
          }`,
        ),
      );
      formData.append("fecha_emision", data.fecha_pago);
      formData.append("monto", data.monto.toString());
      // Repetido, una entrada por id: es lo que el controlador normaliza a
      // un arreglo (Task 5, backend).
      for (const id of data.mantencionIds ?? []) {
        formData.append("mantencionIds", id);
      }

      await uploadComprobanteMutation.mutateAsync(formData);
      if (onComprobanteChanged) {
        onComprobanteChanged();
      }
    } catch (error) {
      console.error("Error al subir el comprobante:", error);
    }
  };

  const guardarPago = async (datos: {
    monto: number;
    fecha_pago: string;
    comprobante?: File;
    mantencionIds: string[];
  }) => {
    await handleSubmitComprobante(datos);
    setHojaPagoAbierta(false);
    setPagoEncadenado(false);
    setVisitaFijada(null);
  };

  // "Omitir por ahora" y el cierre en general de la hoja de pago: la
  // mantencion ya quedo guardada con recibioPago = true en el paso anterior,
  // asi que no se pierde nada por no adjuntar el comprobante ahora - queda
  // disponible para subirlo despues desde la pestana Cobros.
  const cerrarHojaPago = () => {
    setHojaPagoAbierta(false);
    setPagoEncadenado(false);
    setVisitaFijada(null);
  };

  // Apertura directa desde el boton del MonthBar en la pestana Cobros: sin
  // paso 1 y sin visita fijada.
  const abrirHojaPagoDirecta = () => {
    setPagoEncadenado(false);
    setVisitaFijada(null);
    setHojaPagoAbierta(true);
  };

  const handleEditMaintenance = (maintenance: IMaintenance) => {
    setMaintenanceToEdit(maintenance);
    setHojaMantencionAbierta(true);
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
    setHojaMantencionAbierta(true);
  };

  const abrirReparaciones = () => {
    setOpenModal({
      dialogClassName: "h-[40dvh]!",
      bodyClassName: "max-h-[55dvh] overflow-auto custom-scrollbar",
      header: "Reparaciones",
      content: (
        <BodyRepairs
          nombreCliente={clientInfo?.nombre.value}
          showFilters={false}
        />
      ),
    });
  };

  return (
    <Modal
      show={open}
      onHide={handleClose}
      size="xl"
      centered
      contentClassName={style.modal}
      dialogClassName="max-h-[90dvh]"
      enforceFocus={false}
    >
      {loading ? (
        <div className="flex justify-center items-center p-10 min-h-80">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {clientInfo && (
            <ClientDialogHeader
              clientInfo={clientInfo}
              onCerrar={handleClose}
              onGenerarBoleta={abrirBoleta}
              onVerReparaciones={abrirReparaciones}
              puedeGenerarBoleta={mantencionesDelMes.length > 0}
            />
          )}

          <ClientTabs
            activa={pestanaActiva}
            onCambiar={setPestanaActiva}
            conteos={{
              mantenciones: mantencionesDelMes.length,
              // El conteo tambien queda gateado por las dudas (p. ej. si
              // algun consumidor futuro pasa ocultarCobros=false), pero con
              // la pestana oculta ClientTabs nunca llega a leer este valor.
              cobros: isSuperAdmin ? comprobantesDelMes.length : 0,
            }}
            // Reproduce el comportamiento previo al rediseno: el no-superadmin
            // no veia la seccion de comprobantes en absoluto. Una pestana
            // deshabilitada-pero-visible no bastaba (sin `disabled`/
            // `aria-disabled`, el foco de flecha igual podia aterrizar ahi),
            // asi que se oculta por completo en vez de solo bloquear el click.
            ocultarCobros={!isSuperAdmin}
          />

          {pestanaActiva !== "ficha" && (
            <MonthBar
              meses={meses}
              mesActivo={mesActivo}
              onCambiarMes={setMesActivo}
              etiquetaAccion={
                pestanaActiva === "cobros" ? "Registrar pago" : "Registrar mantencion"
              }
              mostrarAccion={pestanaActiva === "mantenciones" || isSuperAdmin}
              onAccion={() =>
                pestanaActiva === "cobros"
                  ? abrirHojaPagoDirecta()
                  : setHojaMantencionAbierta(true)
              }
            />
          )}

          <div
            className={style.panel}
            data-activo={pestanaActiva === "mantenciones" ? "si" : "no"}
            role="tabpanel"
            id="panel-mantenciones"
            aria-labelledby="pestana-mantenciones"
          >
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
              <div>
                <button
                  className="flex items-center gap-1 p-1!"
                  onClick={onAddingMaintenance}
                >
                  Agregar nueva mantención
                  <AddIcon />
                </button>
              </div>
            </div>

            {showMaintenances && (
              <>
                {Object.keys(maintenancesClient ?? {}).length ? (
                  <div className="flex flex-col gap-3">
                    <div className={style.dosColumnas}>
                      <MaintenanceTimeline
                        mantenciones={mantencionesDelMes}
                        proximaVisita={proximaVisita}
                        onEditar={handleEditMaintenance}
                        onEliminar={handleDeleteMaintenance}
                        onRegistrarProxima={() => setHojaMantencionAbierta(true)}
                        puedeEliminar={isSuperAdmin}
                      />
                      <aside className={style.columnaLado}>
                        <MonthStatusPanel
                          mesActivo={mesActivo}
                          valorMantencion={clientInfo?.valor_mantencion?.value ?? 0}
                          mantencionesDelMes={mantencionesDelMes}
                          montoPagado={comprobantesDelMes.reduce(
                            (suma, c) => suma + (c.monto ?? 0),
                            0,
                          )}
                          onGenerarBoleta={abrirBoleta}
                          puedeGenerarBoleta={
                            isSuperAdmin && mantencionesDelMes.length > 0
                          }
                        />
                      </aside>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 ">
                    <p className="text-gray-500">
                      No hay mantenciones para mostrar
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <MaintenanceSheet
            abierta={hojaMantencionAbierta}
            clientId={clientInfo?.id?.value ?? ""}
            valorMantencion={clientInfo?.valor_mantencion?.value ?? 0}
            productosList={products}
            mantencionAEditar={maintenanceToEdit}
            puedeRegistrarPago={isSuperAdmin}
            onCerrar={() => {
              setHojaMantencionAbierta(false);
              setMaintenanceToEdit(null);
            }}
            onGuardar={guardarMantencion}
          />

          <PaymentSheet
            abierta={hojaPagoAbierta}
            encadenada={pagoEncadenado}
            visitaFijada={visitaFijada}
            visitasSinPago={visitasSinPago}
            onCerrar={cerrarHojaPago}
            onGuardar={guardarPago}
          />

          <div
            className={style.panel}
            data-activo={pestanaActiva === "cobros" ? "si" : "no"}
            role="tabpanel"
            id="panel-cobros"
            aria-labelledby="pestana-cobros"
          >
            {maintenancesClient &&
              isSuperAdmin &&
              Object.keys(maintenancesClient).length > 0 && (
                <ComprobantesContainer
                  comprobantesData={comprobantesDelMes}
                  onApprove={handleSubmitComprobante}
                />
              )}
          </div>

          <div
            className={style.panel}
            data-activo={pestanaActiva === "ficha" ? "si" : "no"}
            role="tabpanel"
            id="panel-ficha"
            aria-labelledby="pestana-ficha"
          >
            {clientInfo && (
              <ClientFields
                key={currentIndex}
                clientInfo={clientInfo}
                coordenadas={coordenadas}
                hasMaintenances={mantencionesDelMes.length > 0}
                onClose={handleClose}
                onUpdate={() => {
                  if (onClientUpdated) onClientUpdated();
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Fuera del ternario de loading a proposito: antes del rewrite el
          Modal.Footer era un hermano incondicional, asi que Cerrar y la
          paginacion seguian disponibles mientras cargaban los datos. */}
      <div className={style.pie}>
        {totalRecords > 1 && (
          <>
            <span className={style.piePosicion}>
              Cliente {currentIndex + 1} <small>de {totalRecords}</small>
            </span>
            <div className={style.pieNav}>
              <Button label="‹ Anterior" variant="tertiary" onClick={onPreviousClient} />
              <Button label="Siguiente ›" variant="tertiary" onClick={onNextClient} />
            </div>
          </>
        )}
        <div className={style.pieFin}>
          <Button label="Cerrar" variant="primary" onClick={handleClose} />
        </div>
      </div>
    </Modal>
  );
};

export default InfoClientDialog;
