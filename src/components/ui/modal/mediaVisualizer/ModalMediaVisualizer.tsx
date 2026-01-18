import Modal from "react-bootstrap/Modal";
import Button from "../../button/Button";
import { useModalStore } from "../../../../store/ModalStore";

const ModalMediaVisualizer = () => {
  const visible = useModalStore((state) => state.isModalOpen);
  const headerData = useModalStore((state) => state.headerContent);
  const mediaData = useModalStore((state) => state.modalContent);
  const onClose = useModalStore((state) => state.closeModal);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      show={visible}
      onHide={handleClose}
      animation={false}
      dialogClassName="max-w-[90vw]! max-h-[90vh]!"
      centered
      size="xl"
    >
      <Modal.Header closeButton>{headerData}</Modal.Header>
      <Modal.Body className="p-0! h-[80vh]">{mediaData}</Modal.Body>
      <Modal.Footer>
        <Button label="Cancelar" variant="secondary" onClick={handleClose} />
        <Button label="Aceptar" variant="primary" onClick={handleClose} />
      </Modal.Footer>
    </Modal>
  );
};

export default ModalMediaVisualizer;
