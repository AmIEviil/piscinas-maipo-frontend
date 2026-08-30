import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import BodyHome from "../../components/home/bodyHome/BodyHome";
import SolicitarProductosModal from "../../components/inventory/ModalSolicitudProductos/SolicitarProductosModal";
import LowStockAlertModal from "../../components/home/alerts/LowStockAlertModal";
import IngresoStockModal from "../../components/home/alerts/IngresoStockModal";
import PendingMaintenancesModal from "../../components/home/alerts/PendingMaintenancesModal";
import { useSolicitudProductosStore } from "../../store/SolicitudProductosStore";
import { useHomeAlertsStore } from "../../store/HomeAlertsStore";
import { useBoundStore } from "../../store/BoundedStore";
import { useHomeAlertsData } from "../../hooks/HomeAlertsHooks";
import { PAGE_ROUTES } from "../../constant/routes";

type AlertaVisible = "lowStock" | "ingresoStock" | "mantenciones" | null;

export const HomeView = () => {
  const navigate = useNavigate();

  const {
    isModalOpen,
    closeModal,
    openModal,
    setTypeProduct,
    setProductosSolicitables,
    setSelectedProductId,
  } = useSolicitudProductosStore();

  const dismissAlert = useHomeAlertsStore((state) => state.dismissAlert);
  const setDayFilter = useBoundStore((state) => state.setDayFilter);
  const setSelectAllOnLoad = useBoundStore((state) => state.setSelectAllOnLoad);

  const {
    lowStockProducts,
    diaActual,
    mantencionesFaltantes,
    loading,
    refetchLowStock,
  } = useHomeAlertsData();

  const [alertaVisible, setAlertaVisible] = useState<AlertaVisible>(null);

  // Solo se encadena la alerta de mantenciones al cerrar la solicitud si el
  // modal se abrio desde la alerta de stock, y no desde una tarjeta del Home.
  const solicitudDesdeAlerta = useRef(false);

  /**
   * Muestra la alerta de mantenciones si corresponde, o cierra todo. Se lee el
   * store con getState porque esto corre justo despues de un dismissAlert y el
   * valor del render todavia seria el anterior.
   */
  const mostrarSiguienteAlerta = useCallback(() => {
    const { dismissed } = useHomeAlertsStore.getState();
    const debeAvisar =
      !!diaActual &&
      mantencionesFaltantes > 0 &&
      !dismissed.mantencionesPendientes;
    setAlertaVisible(debeAvisar ? "mantenciones" : null);
  }, [diaActual, mantencionesFaltantes]);

  // Primera evaluacion, una vez que llegaron los datos.
  const yaEvaluado = useRef(false);
  useEffect(() => {
    if (loading || yaEvaluado.current) return;
    yaEvaluado.current = true;

    const { dismissed } = useHomeAlertsStore.getState();
    if (lowStockProducts.length > 0 && !dismissed.lowStock) {
      setAlertaVisible("lowStock");
      return;
    }
    mostrarSiguienteAlerta();
  }, [loading, lowStockProducts, mostrarSiguienteAlerta]);

  const handleAceptarStock = () => {
    dismissAlert("lowStock");
    mostrarSiguienteAlerta();
  };

  const handleSolicitarProductos = () => {
    dismissAlert("lowStock");
    setAlertaVisible(null);

    // lowStockProducts viene ordenado del mas escaso al menos escaso, asi que
    // el primero es el mas critico y queda preseleccionado en el modal.
    const masCritico = lowStockProducts[0];
    setProductosSolicitables(lowStockProducts);
    if (masCritico) {
      setSelectedProductId(masCritico.id ?? "");
      setTypeProduct(masCritico.nombre);
    }
    solicitudDesdeAlerta.current = true;
    openModal();
  };

  /**
   * Solicitud abierta desde el indicador de stock bajo del panel.
   *
   * Comparte la preseleccion con la alerta, pero no marca solicitudDesdeAlerta:
   * el indicador esta siempre a la vista y encadenar la alerta de mantenciones
   * cada vez que se cierra el modal seria una interrupcion sin motivo.
   */
  const handleSolicitarDesdeKpi = () => {
    const masCritico = lowStockProducts[0];
    setProductosSolicitables(lowStockProducts);
    if (masCritico) {
      setSelectedProductId(masCritico.id ?? "");
      setTypeProduct(masCritico.nombre);
    }
    openModal();
  };

  const handleCerrarSolicitud = () => {
    closeModal();
    if (solicitudDesdeAlerta.current) {
      solicitudDesdeAlerta.current = false;
      mostrarSiguienteAlerta();
    }
  };

  const handleYaHayStock = () => {
    setAlertaVisible("ingresoStock");
  };

  const handleCancelarIngresoStock = () => {
    setAlertaVisible("lowStock");
  };

  const handleStockActualizado = async () => {
    dismissAlert("lowStock");
    await refetchLowStock();
    mostrarSiguienteAlerta();
  };

  const handleAceptarMantenciones = () => {
    dismissAlert("mantencionesPendientes");
    setAlertaVisible(null);
  };

  const handleIrARegistrar = () => {
    dismissAlert("mantencionesPendientes");
    setAlertaVisible(null);
    if (diaActual) setDayFilter(diaActual);
    setSelectAllOnLoad(true);
    navigate(PAGE_ROUTES.Clientes);
  };

  return (
    <div>
      {/*
        Los indicadores del panel se alimentan del stock bajo y del dia habil
        que esta vista ya consulto para las alertas: se pasan como props para no
        repetir la misma peticion dentro de BodyHome.
      */}
      <BodyHome
        productosBajoMinimo={lowStockProducts.length}
        diaActual={diaActual}
        onVerBajoMinimo={handleSolicitarDesdeKpi}
      />
      <LowStockAlertModal
        open={alertaVisible === "lowStock"}
        productos={lowStockProducts}
        onAceptar={handleAceptarStock}
        onSolicitarProductos={handleSolicitarProductos}
        onYaHayStock={handleYaHayStock}
      />
      <IngresoStockModal
        open={alertaVisible === "ingresoStock"}
        productos={lowStockProducts}
        onClose={handleCancelarIngresoStock}
        onStockActualizado={handleStockActualizado}
      />
      <PendingMaintenancesModal
        open={alertaVisible === "mantenciones"}
        dia={diaActual ?? ""}
        faltantes={mantencionesFaltantes}
        onAceptar={handleAceptarMantenciones}
        onIrARegistrar={handleIrARegistrar}
      />
      <SolicitarProductosModal
        open={isModalOpen}
        onClose={handleCerrarSolicitud}
      />
    </div>
  );
};
