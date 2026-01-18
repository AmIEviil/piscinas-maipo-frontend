import { Modal } from "react-bootstrap";
import { useClientResumenMonthStore } from "../../../../store/ClientStore";
import { formatMonthTitle } from "../../../../utils/DateUtils";
import { formatMoneyNumber } from "../../../../utils/formatTextUtils";
import { useEffect, useState } from "react";
import CopyIcon from "../../../ui/Icons/CopyIcon";

const BoletaModalContainer = () => {
  const modalVisible = useClientResumenMonthStore((state) => state.isModalOpen);
  const closeModal = useClientResumenMonthStore((state) => state.closeModal);
  const clientInfo = useClientResumenMonthStore((state) => state.clientInfo);
  const resumenMonth = useClientResumenMonthStore(
    (state) => state.resumenMonth,
  );

  const mapProducts = resumenMonth?.resumenMateriales
    ? Object.entries(resumenMonth.resumenMateriales)
        .map(
          ([key, value]) =>
            `- ${key}: ${value.cantidad} x ${formatMoneyNumber(value.valorUnitario)} = ${formatMoneyNumber(value.total)}`,
        )
        .join("\n")
    : "- Ninguno";

  const baseText =
    `Estimado(a) - ${clientInfo?.nombre?.value}\n\n` +
    `Junto con saludar, envio boleta correspondiente al mes ${formatMonthTitle(String(resumenMonth?.mes))}\n` +
    `Detalle:\n` +
    `Productos: \n${mapProducts}\n` +
    `Total Productos: ${formatMoneyNumber(resumenMonth?.totalProductos)}\n` +
    `Total Mantenciones: ${formatMoneyNumber(resumenMonth?.totalMantencion)}\n` +
    `Total a Pagar: ${formatMoneyNumber(resumenMonth?.granTotal)}\n`;

  const [resumenText, setResumenText] = useState("");

  useEffect(() => {
    setResumenText(baseText);
  }, [baseText]);

  if (!resumenMonth || !clientInfo) {
    return null;
  }

  return (
    <Modal
      show={modalVisible}
      centered
      onHide={() => closeModal()}
      key={clientInfo.id.value}
    >
      <Modal.Header closeButton>
        <h2 className="text-xl font-bold">
          Boleta de Pago - {clientInfo?.nombre?.value}
        </h2>
      </Modal.Header>
      <Modal.Body>
        {/* <pre className="whitespace-pre-wrap">{baseText}</pre> */}
        <textarea
          className="w-full h-160 mt-4 p-2 border border-gray-300 rounded"
          value={resumenText}
          onChange={(e) => setResumenText(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer className="flex justify-between items-center">
        <button className="secondary" onClick={() => closeModal()}>
          Cerrar
        </button>
        <button
          className="primary flex items-center"
          onClick={() => {
            navigator.clipboard.writeText(resumenText);
          }}
        >
          Copiar Texto
          <CopyIcon className="inline mr-2" color="white" />
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default BoletaModalContainer;
