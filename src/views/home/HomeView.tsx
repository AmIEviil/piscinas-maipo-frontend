import BodyHome from "../../components/home/bodyHome/BodyHome";
import SolicitarProductosModal from "../../components/inventory/ModalSolicitudProductos/SolicitarProductosModal";
import { useSolicitudProductosStore } from "../../store/SolicitudProductosStore";

export const HomeView = () => {
  const { isModalOpen, closeModal } = useSolicitudProductosStore();

  return (
    <div>
      <div>
        <BodyHome />
      </div>
      <SolicitarProductosModal
        open={isModalOpen}
        onClose={() => closeModal()}
      />
    </div>
  );
};
