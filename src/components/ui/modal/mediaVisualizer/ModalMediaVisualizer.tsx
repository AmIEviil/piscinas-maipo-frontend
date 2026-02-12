import Modal from "react-bootstrap/Modal";
import Button from "../../button/Button";
import { useModalStore } from "../../../../store/ModalStore";

const ModalMediaVisualizer = () => {
  const visible = useModalStore((state) => state.isModalOpen);
  const dialogClassName = useModalStore((state) => state.dialogClassName);
  const headerData = useModalStore((state) => state.headerContent);
  const mediaData = useModalStore((state) => state.modalContent);
  const footerData = useModalStore((state) => state.footerContent);
  const onClose = useModalStore((state) => state.closeModal);
  const onAccept = useModalStore((state) => state.onAccept);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      show={visible}
      onHide={handleClose}
      animation={false}
      dialogClassName={`max-w-[90vw]! max-h-[90vh]! ${dialogClassName}`}
      centered
      size="xl"
    >
      <Modal.Header closeButton>{headerData}</Modal.Header>
      <Modal.Body>{mediaData}</Modal.Body>
      <Modal.Footer>
        {footerData || (
          <>
            <Button
              label="Cancelar"
              variant="secondary"
              onClick={handleClose}
            />
            <Button
              label="Aceptar"
              variant="primary"
              onClick={onAccept || handleClose}
            />
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ModalMediaVisualizer;
