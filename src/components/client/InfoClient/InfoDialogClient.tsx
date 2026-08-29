import { useEffect, useMemo, useRef, useState } from "react";
import {
  type IMaintenance,
  type IMaintenanceCreate,
  type IMaintenanceUpdate,
} from "../../../service/maintenance.interface";
import style from "./InfoDialogClient.module.css";

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
import ClientProfilePanel from "./profile/ClientProfilePanel";
import { Modal } from "react-bootstrap";
import Button from "../../ui/button/Button";
import {
  useUploadComprobantePago,
  useDeleteComprobantePago,
} from "../../../hooks/ComprobantePagosHooks";
import { formatName } from "../../../utils/formatTextUtils";
import type { IComprobantePago } from "../../../service/ComprobantePagos.interface";
import PaymentsPanel from "./payments/PaymentsPanel";
import MediaVisualizer from "../../ui/modal/mediaVisualizer/MediaVisualizer";
import LoadingSpinner from "../../ui/loading/Loading";
import { useClientResumenMonthStore } from "../../../store/ClientStore";
import MaintenanceTimeline from "./maintenances/MaintenanceTimeline";
import MonthStatusPanel from "./maintenances/MonthStatusPanel";
import { useModalStore } from "../../../store/ModalStore";
import FieldGroup from "../../ui/labelField/FieldGroup";
import { usePermits } from "../../../utils/roleUtils";
import { useSnackbar } from "../../../utils/snackBarHooks";
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

// Duraciones que SlideSheet.module.css declara para `.hoja` (transform,
// 0.26s) y `.velo` (opacity, 0.2s). Duplicadas aca a proposito: SlideSheet no
// las expone como constantes, y el puente de velo del encadenado (ver
// guardarMantencion) necesita conocerlas para saber cuanto durar. Si esos
// valores cambian en SlideSheet.module.css, estos dos deben actualizarse
// junto con ellos.
const TRANSICION_HOJA_MS = 260;
const TRANSICION_VELO_MS = 200;

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
  const { showSnackbar } = useSnackbar();

  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();

  const uploadComprobanteMutation = useUploadComprobantePago();
  const deleteComprobanteMutation = useDeleteComprobantePago();
  const setResumenMonthStore = useClientResumenMonthStore(
    (state) => state.setResumenMonth,
  );
  const setClientInfo = useClientResumenMonthStore(
    (state) => state.setClientInfo,
  );
  // Se lee el resumen ademas de escribirlo: es lo que habilita los puntos de
  // entrada a la boleta (ver `puedeGenerarBoleta`).
  const resumenMonthStore = useClientResumenMonthStore(
    (state) => state.resumenMonth,
  );
  const abrirBoleta = useClientResumenMonthStore((state) => state.openModal);
  const setOpenModal = useModalStore((state) => state.openModal);
  const handleCloseModal = useModalStore((state) => state.closeModal);

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
  // Puente entre los velos de las dos hojas encadenadas: cubre el fondo
  // mientras el velo de la hoja de mantencion ya termino de apagarse pero el
  // de la hoja de pago todavia no llega a su propia opacidad plena. Ver
  // guardarMantencion.
  const [puenteVeloVisible, setPuenteVeloVisible] = useState(false);
  // Handles de los dos setTimeout del encadenado (abrir la hoja de pago,
  // apagar el puente). Guardados en refs -no en variables locales- porque
  // sobreviven a un cierre temprano del dialogo entero: sin limpiarlos, un
  // cierre dentro de esa ventana de 260-460ms deja el timer vivo, que
  // despues reabre la hoja de pago (o esconde el puente) sobre el dialogo
  // ya cerrado o reabierto con otro cliente.
  const hojaPagoTimeoutRef = useRef<number | null>(null);
  const puenteVeloTimeoutRef = useRef<number | null>(null);

  const limpiarTimersEncadenado = () => {
    if (hojaPagoTimeoutRef.current !== null) {
      window.clearTimeout(hojaPagoTimeoutRef.current);
      hojaPagoTimeoutRef.current = null;
    }
    if (puenteVeloTimeoutRef.current !== null) {
      window.clearTimeout(puenteVeloTimeoutRef.current);
      puenteVeloTimeoutRef.current = null;
    }
  };

  // Red de seguridad si el componente se desmonta con el encadenado a medio
  // camino (los refs no dependen de closures viejas: se leen via .current).
  useEffect(() => {
    return () => {
      if (hojaPagoTimeoutRef.current !== null) {
        window.clearTimeout(hojaPagoTimeoutRef.current);
      }
      if (puenteVeloTimeoutRef.current !== null) {
        window.clearTimeout(puenteVeloTimeoutRef.current);
      }
    };
  }, []);

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

  // Total cobrable del mes para el panel lateral de la pestana Cobros: el
  // mismo calculo que MonthStatusPanel.calcularResumen (mantenciones
  // realizadas * valor de mantencion, mas productos), pero calculado aca para
  // que la pestana Cobros no dependa de que el panel de la pestana
  // Mantenciones este montado ni de cuando ese panel recalculo.
  const totalMesCobros = useMemo(() => {
    const valorMantencion = clientInfo?.valor_mantencion?.value ?? 0;
    return mantencionesDelMes.reduce((suma, mantencion) => {
      const totalProductos = mantencion.productos.reduce(
        (subtotal, p) => subtotal + p.product.valor_unitario * p.cantidad,
        0,
      );
      return suma + (mantencion.realizada ? valorMantencion : 0) + totalProductos;
    }, 0);
  }, [mantencionesDelMes, clientInfo]);

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

  /**
   * Puntos de entrada a la boleta (cabecera, panel del mes y panel de
   * cobros).
   *
   * No basta con `mantencionesDelMes.length > 0`: `BoletaModalContainer` lee
   * el resumen desde `useClientResumenMonthStore` y devuelve `null` si no hay
   * ninguno, asi que un boton habilitado sin resumen en el store no hace
   * absolutamente nada y el usuario no recibe ninguna senal. Se exige aqui
   * que el resumen exista Y que corresponda al mes activo, de modo que el
   * boton no pueda estar vivo contra datos que no estan.
   */
  const puedeGenerarBoleta =
    isSuperAdmin &&
    mantencionesDelMes.length > 0 &&
    resumenMonthStore != null &&
    resumenMonthStore.mes === mesActivo;

  const handleClose = () => {
    // Si el dialogo entero se cierra a mitad del encadenado (dentro de la
    // ventana de 260-460ms entre guardar la mantencion y que la hoja de pago
    // termine de aparecer), hay que cortar los timers pendientes: si no,
    // igual disparan despues y reabren la hoja de pago (o esconden el
    // puente) sobre el modal ya cerrado o reabierto con otro cliente.
    limpiarTimersEncadenado();
    setPuenteVeloVisible(false);
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
    // `||`, no `&&`: con && bastaba que existiera el mes para escribir
    // `undefined` en el store cuando el cliente todavia no habia llegado, y
    // BoletaModalContainer se queda en `null` sin clientInfo.
    if (!mesActivo || !clientInfo) return;
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
      // `useCreateMaintenance` / `useUpdateMaintenance` ya muestran el
      // snackbar de error en su `onError`. Lo que aporta este catch es
      // devolver `undefined` para que quien llama sepa que NO hay que
      // avanzar el flujo (ver guardarMantencion).
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

    // El guardado fallo: la hoja se queda abierta con lo que el usuario
    // escribio, y no se encadena nada. Antes se cerraba igual y, si venia
    // marcado "Si, pago", se encadenaba la hoja de pago con visitaFijada en
    // null, de modo que el usuario veia un flujo exitoso sobre un guardado
    // que nunca ocurrio. El mensaje de error lo pone el `onError` del hook
    // de la mutacion.
    if (!creada) return;

    setHojaMantencionAbierta(false);

    if (!registrarPago) return;

    setVisitaFijada({
      id: creada.id,
      etiqueta: formatDateToDDMMYYYY(creada.fechaMantencion),
      monto: clientInfo?.valor_mantencion?.value ?? 0,
    });
    setPagoEncadenado(true);

    // Puente de velo: sube ya, en el mismo tick en que empieza a cerrar la
    // hoja de mantencion, y se mantiene visible hasta que el velo propio de
    // la hoja de pago llegue a su propia opacidad plena (TRANSICION_HOJA_MS
    // + TRANSICION_VELO_MS despues). Sin el, entre el momento en que el
    // velo de la hoja de mantencion termina de apagarse (TRANSICION_VELO_MS)
    // y el momento en que arranca a abrirse el de la hoja de pago
    // (TRANSICION_HOJA_MS) quedaria un hueco de fondo descubierto -y
    // clickeable, porque un velo en opacidad 0 tambien tiene
    // pointer-events:none.
    setPuenteVeloVisible(true);
    limpiarTimersEncadenado();

    // La hoja de mantencion tiene 260ms de transicion de salida (ver
    // SlideSheet.module.css, `.hoja`). Se espera a que termine para que
    // nunca haya dos dialogos vivos a la vez.
    hojaPagoTimeoutRef.current = window.setTimeout(() => {
      hojaPagoTimeoutRef.current = null;
      setHojaPagoAbierta(true);
    }, TRANSICION_HOJA_MS);

    // El velo de la hoja de pago (SlideSheet propio) tarda otros
    // TRANSICION_VELO_MS en llegar a opacidad plena desde que la hoja abre;
    // recien ahi el puente deja de hacer falta.
    puenteVeloTimeoutRef.current = window.setTimeout(() => {
      puenteVeloTimeoutRef.current = null;
      setPuenteVeloVisible(false);
    }, TRANSICION_HOJA_MS + TRANSICION_VELO_MS);
  };

  const handleSubmitComprobante = async (data: {
    monto: number;
    fecha_pago: string;
    comprobante?: File;
    mantencionIds?: string[];
  }): Promise<boolean> => {
    if (!data || !clientInfo || !mesActivo) {
      // Antes esto era un `return` mudo y la hoja se cerraba igual: el pago
      // se perdia sin que nada lo dijera.
      showSnackbar(
        "No se pudo registrar el pago: falta el cliente o el mes.",
        "error",
      );
      return false;
    }
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
      return true;
    } catch (error) {
      // `useUploadComprobantePago` ya muestra el snackbar de error. Aca solo
      // se informa el fallo para que la hoja de pago no se cierre y no se
      // pierda el archivo que el usuario ya habia adjuntado.
      console.error("Error al subir el comprobante:", error);
      return false;
    }
  };

  const guardarPago = async (datos: {
    monto: number;
    fecha_pago: string;
    comprobante?: File;
    mantencionIds: string[];
  }) => {
    const guardado = await handleSubmitComprobante(datos);

    // Si la subida fallo, la hoja se queda abierta con el monto, la fecha,
    // las visitas marcadas y el comprobante ya adjunto, para reintentar sin
    // volver a llenarla.
    if (!guardado) return;

    // Defensivo: para cuando esto corre, los timers del encadenado ya
    // deberian haber disparado solos (la hoja de pago solo es interactuable
    // una vez abierta). Se limpian igual por si el usuario alcanzo a
    // guardar en la ventana de 260-460ms, antes de que el timer del puente
    // dispare.
    limpiarTimersEncadenado();
    setPuenteVeloVisible(false);
    setHojaPagoAbierta(false);
    setPagoEncadenado(false);
    setVisitaFijada(null);
  };

  // "Omitir por ahora" y el cierre en general de la hoja de pago: la
  // mantencion ya quedo guardada con recibioPago = true en el paso anterior,
  // asi que no se pierde nada por no adjuntar el comprobante ahora - queda
  // disponible para subirlo despues desde la pestana Cobros.
  const cerrarHojaPago = () => {
    limpiarTimersEncadenado();
    setPuenteVeloVisible(false);
    setHojaPagoAbierta(false);
    setPagoEncadenado(false);
    setVisitaFijada(null);
  };

  // Apertura directa desde el boton del MonthBar en la pestana Cobros: sin
  // paso 1 y sin visita fijada. Tambien corta cualquier encadenado que
  // hubiera quedado a medio camino.
  const abrirHojaPagoDirecta = () => {
    limpiarTimersEncadenado();
    setPuenteVeloVisible(false);
    setPagoEncadenado(false);
    setVisitaFijada(null);
    setHojaPagoAbierta(true);
  };

  // Solo abre la hoja. No dispara `onMaintenanceCreated` (un refetch): abrir
  // el formulario de edicion no cambia ningun dato, y el refetch de verdad ya
  // ocurre al guardar, dentro de handleAcceptMaintenance.
  const handleEditMaintenance = (maintenance: IMaintenance) => {
    setMaintenanceToEdit(maintenance);
    setHojaMantencionAbierta(true);
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

  /**
   * Que media mostrar en la vista previa de un comprobante: imagen embebida
   * por su fileId de Drive, o iframe (PDF / video) apuntando a `viewUrl`.
   * Portado sin cambios de `ComprobantesContainer.tsx` (`mapComprobante`).
   */
  const mapComprobantePago = (comprobante: IComprobantePago) => {
    const mimeType = comprobante.fileInfo?.mimeType ?? "";
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";
    const isVideo = mimeType.startsWith("video/");

    let resourceUrl = "";
    let kind = "other";

    if (isImage) {
      kind = "img";
      resourceUrl = `https://lh3.googleusercontent.com/d/${comprobante.fileId}`;
    } else if (isPdf || isVideo) {
      kind = "iframe";
      resourceUrl = comprobante.viewUrl;
    }

    return {
      _kind: kind,
      url: resourceUrl,
      name: comprobante.nombre,
    };
  };

  const handleVerComprobante = (comprobante: IComprobantePago) => {
    setOpenModal({
      header: (
        <b className="text-header-modal">
          Visualizando: {comprobante.nombre}
        </b>
      ),
      content: (
        <div className="w-full h-full flex justify-center items-center">
          <MediaVisualizer
            currentMedia={mapComprobantePago(comprobante)}
            fullScreenImage={true}
          />
        </div>
      ),
    });
  };

  const handleEliminarComprobanteConfirmado = async (id: string) => {
    try {
      await deleteComprobanteMutation.mutateAsync(id);
      handleCloseModal();
    } catch (error) {
      // `useDeleteComprobantePago` ya muestra el snackbar de error. El
      // dialogo de confirmacion se deja abierto a proposito -handleCloseModal
      // solo corre en la rama exitosa- para que el usuario pueda reintentar
      // en vez de quedarse creyendo que el comprobante se elimino.
      console.error("Error al eliminar el comprobante:", error);
    }
  };

  const handleEliminarComprobante = (id: string) => {
    setOpenModal({
      dialogClassName: "max-w-md! max-h-md!",
      header: <b className="text-header-modal">Confirmar eliminación</b>,
      content: (
        <div className="flex flex-col gap-4">
          <span>¿Estás seguro de que deseas eliminar este comprobante?</span>
        </div>
      ),
      footer: (
        <>
          <Button label="Cancelar" onClick={handleCloseModal} />
          <Button
            label="Confirmar"
            onClick={() => handleEliminarComprobanteConfirmado(id)}
          />
        </>
      ),
    });
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
              puedeGenerarBoleta={puedeGenerarBoleta}
            />
          )}

          <ClientTabs
            activa={pestanaActiva}
            onCambiar={setPestanaActiva}
            conteos={{
              mantenciones: mantencionesDelMes.length,
              // La pestana Cobros es visible para todos los roles (ver
              // PaymentsPanel): el conteo refleja los comprobantes reales del
              // mes sin gatear por isSuperAdmin.
              cobros: comprobantesDelMes.length,
            }}
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

          {/* tabIndex={0}: el panel scrollea, asi que tiene que poder recibir
              foco para que se pueda desplazar solo con teclado, sin depender
              de aterrizar antes en algun control de adentro (spec, §10). */}
          <div
            className={style.panel}
            data-activo={pestanaActiva === "mantenciones" ? "si" : "no"}
            role="tabpanel"
            id="panel-mantenciones"
            aria-labelledby="pestana-mantenciones"
            tabIndex={0}
          >
            {Object.keys(maintenancesClient ?? {}).length ? (
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
                    puedeGenerarBoleta={puedeGenerarBoleta}
                  />
                </aside>
              </div>
            ) : (
              <p className={style.vacio}>No hay mantenciones para mostrar.</p>
            )}
          </div>

          {puenteVeloVisible && (
            <div className={style.puenteVelo} aria-hidden="true" />
          )}

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
            tabIndex={0}
          >
            <PaymentsPanel
              comprobantes={comprobantesDelMes}
              totalMes={totalMesCobros}
              visitasSinPago={visitasSinPago}
              puedeEscribir={isSuperAdmin}
              puedeGenerarBoleta={puedeGenerarBoleta}
              onVer={handleVerComprobante}
              onEliminar={handleEliminarComprobante}
              onGenerarBoleta={abrirBoleta}
              onRegistrarPago={abrirHojaPagoDirecta}
            />
          </div>

          <div
            className={style.panel}
            data-activo={pestanaActiva === "ficha" ? "si" : "no"}
            role="tabpanel"
            id="panel-ficha"
            aria-labelledby="pestana-ficha"
            tabIndex={0}
          >
            {clientInfo && (
              <ClientProfilePanel
                clientInfo={clientInfo}
                puedeEditar={isSuperAdmin}
                onVerReparaciones={abrirReparaciones}
                onActualizado={() => onClientUpdated?.()}
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
